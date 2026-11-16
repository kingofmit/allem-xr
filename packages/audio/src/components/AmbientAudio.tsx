'use client'

import React from 'react'
import { useAmbientAudio } from '../hooks/useAmbientAudio'
import type { AmbientAudioProps } from '../types'

/**
 * Declarative ambient (non-spatial) audio.
 */
export function AmbientAudio({
  src,
  volume = 0.5,
  loop = true,
  autoplay = true,
}: AmbientAudioProps) {
  useAmbientAudio(src, { volume, loop, autoplay })
  return null
}
