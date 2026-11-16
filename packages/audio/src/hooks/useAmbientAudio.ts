'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { getAudioContext, resumeAudioContext } from '../audioContext'

interface AmbientAudioOptions {
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

/**
 * Non-spatial audio playback (background music, ambience).
 */
export function useAmbientAudio(src: string, options?: AmbientAudioOptions) {
  const { volume = 1, loop = true, autoplay = false } = options ?? {}

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const ctx = getAudioContext()
    const audio = new Audio(src)
    audio.crossOrigin = 'anonymous'
    audio.loop = loop
    audio.preload = 'auto'

    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, ctx.currentTime)

    source.connect(gain)
    gain.connect(ctx.destination)

    audioRef.current = audio
    gainRef.current = gain

    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', handleEnded)

    if (autoplay) {
      resumeAudioContext().then(() => {
        audio.play().catch(() => {})
        setIsPlaying(true)
      })
    }

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
      audio.src = ''
      source.disconnect()
      gain.disconnect()
      audioRef.current = null
      gainRef.current = null
    }
  }, [src])

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime(volume, getAudioContext().currentTime)
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop
  }, [loop])

  const play = useCallback(async () => {
    await resumeAudioContext()
    if (audioRef.current) {
      await audioRef.current.play()
      setIsPlaying(true)
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  return { play, pause, stop, isPlaying }
}
