'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { getAudioContext, resumeAudioContext } from '../audioContext'
import type { SpatialAudioConfig, SpatialAudioState } from '../types'

/**
 * Play audio at a 3D position with HRTF spatialization.
 */
export function useSpatialAudio(src: string, config?: SpatialAudioConfig): SpatialAudioState {
  const {
    position = [0, 0, 0],
    maxDistance = 10,
    rolloffFactor = 1,
    refDistance = 1,
    coneInnerAngle = 360,
    coneOuterAngle = 360,
    coneOuterGain = 0,
    loop = false,
    volume = 1,
    autoplay = false,
    hrtf = true,
  } = config ?? {}

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const pannerRef = useRef<PannerNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Initialize audio nodes
  useEffect(() => {
    const ctx = getAudioContext()
    const audio = new Audio(src)
    audio.crossOrigin = 'anonymous'
    audio.loop = loop
    audio.preload = 'auto'

    const source = ctx.createMediaElementSource(audio)
    const panner = ctx.createPanner()
    const gain = ctx.createGain()

    panner.panningModel = hrtf ? 'HRTF' : 'equalpower'
    panner.distanceModel = 'inverse'
    panner.maxDistance = maxDistance
    panner.rolloffFactor = rolloffFactor
    panner.refDistance = refDistance
    panner.coneInnerAngle = coneInnerAngle
    panner.coneOuterAngle = coneOuterAngle
    panner.coneOuterGain = coneOuterGain
    panner.positionX.setValueAtTime(position[0], ctx.currentTime)
    panner.positionY.setValueAtTime(position[1], ctx.currentTime)
    panner.positionZ.setValueAtTime(position[2], ctx.currentTime)

    gain.gain.setValueAtTime(volume, ctx.currentTime)

    source.connect(panner)
    panner.connect(gain)
    gain.connect(ctx.destination)

    audioRef.current = audio
    sourceNodeRef.current = source
    pannerRef.current = panner
    gainRef.current = gain

    const handleMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadedmetadata', handleMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    if (autoplay) {
      resumeAudioContext().then(() => {
        audio.play().catch(() => {})
        setIsPlaying(true)
      })
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.pause()
      audio.src = ''
      source.disconnect()
      panner.disconnect()
      gain.disconnect()
      audioRef.current = null
      sourceNodeRef.current = null
      pannerRef.current = null
      gainRef.current = null
    }
  }, [src]) // Only recreate when src changes

  // Update panner position when config changes
  useEffect(() => {
    const panner = pannerRef.current
    if (!panner) return
    const ctx = getAudioContext()
    panner.positionX.setValueAtTime(position[0], ctx.currentTime)
    panner.positionY.setValueAtTime(position[1], ctx.currentTime)
    panner.positionZ.setValueAtTime(position[2], ctx.currentTime)
  }, [position[0], position[1], position[2]])

  // Update volume
  useEffect(() => {
    const gain = gainRef.current
    if (!gain) return
    gain.gain.setValueAtTime(volume, getAudioContext().currentTime)
  }, [volume])

  // Update loop
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop
  }, [loop])

  const play = useCallback(async () => {
    await resumeAudioContext()
    const audio = audioRef.current
    if (!audio) return
    await audio.play()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const setPosition = useCallback((x: number, y: number, z: number) => {
    const panner = pannerRef.current
    if (!panner) return
    const ctx = getAudioContext()
    panner.positionX.setValueAtTime(x, ctx.currentTime)
    panner.positionY.setValueAtTime(y, ctx.currentTime)
    panner.positionZ.setValueAtTime(z, ctx.currentTime)
  }, [])

  const setVolume = useCallback((v: number) => {
    const gain = gainRef.current
    if (!gain) return
    gain.gain.setValueAtTime(v, getAudioContext().currentTime)
  }, [])

  return { play, pause, stop, seek, setPosition, setVolume, isPlaying, currentTime, duration }
}
