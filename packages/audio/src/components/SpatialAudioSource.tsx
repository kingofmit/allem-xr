'use client'

import React, { useEffect } from 'react'
import { useSpatialAudio } from '../hooks/useSpatialAudio'
import type { SpatialAudioSourceProps } from '../types'

/**
 * Declarative spatial audio source positioned in 3D space.
 */
export function SpatialAudioSource({
  src,
  position = [0, 0, 0],
  maxDistance = 10,
  rolloffFactor = 1,
  refDistance = 1,
  loop = false,
  volume = 1,
  autoplay = true,
  hrtf = true,
}: SpatialAudioSourceProps) {
  const audio = useSpatialAudio(src, {
    position,
    maxDistance,
    rolloffFactor,
    refDistance,
    loop,
    volume,
    autoplay,
    hrtf,
  })

  // Update position when prop changes
  useEffect(() => {
    audio.setPosition(position[0], position[1], position[2])
  }, [position[0], position[1], position[2], audio.setPosition])

  return null // No visual output
}
