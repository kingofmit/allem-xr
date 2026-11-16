'use client'

import React from 'react'
import type { AudioZoneProps } from '../types'

/**
 * Defines a spatial audio zone with reverb/dampening.
 * Children inside this zone receive modified audio processing.
 * (Note: Full convolution reverb requires impulse response loading.
 *  This provides the zone tracking and metadata — reverb processing
 *  is applied via the parent audio pipeline.)
 */
export function AudioZone({
  children,
  position = [0, 0, 0],
  radius = 5,
  volume = 1,
  reverb = 'none',
  dampening = 0,
}: AudioZoneProps) {
  return (
    <group
      position={position}
      userData={{
        audioZone: true,
        radius,
        volume,
        reverb,
        dampening,
      }}
    >
      {children}
    </group>
  )
}
