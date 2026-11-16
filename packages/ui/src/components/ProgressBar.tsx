'use client'


import React from 'react'
import { SpatialText } from './SpatialText'
import type { ProgressBarProps } from '../types'

const BAR_HEIGHT = 0.008

/**
 * A progress bar showing completion state.
 */
export function ProgressBar({
  value,
  width = 0.2,
  label,
  color = '#4488ff',
  trackColor = '#333333',
  position = [0, 0, 0],
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))

  return (
    <group position={position}>
      {/* Label */}
      {label && (
        <SpatialText
          text={label}
          fontSize={0.012}
          color="#aaaaaa"
          anchorX="left"
          anchorY="bottom"
          position={[-width / 2, BAR_HEIGHT / 2 + 0.006, 0]}
        />
      )}

      {/* Percentage */}
      <SpatialText
        text={`${Math.round(clamped * 100)}%`}
        fontSize={0.011}
        color="#cccccc"
        anchorX="right"
        anchorY="bottom"
        position={[width / 2, BAR_HEIGHT / 2 + 0.006, 0]}
      />

      {/* Track */}
      <mesh>
        <planeGeometry args={[width, BAR_HEIGHT]} />
        <meshBasicMaterial color={trackColor} />
      </mesh>

      {/* Fill */}
      {clamped > 0 && (
        <mesh position={[-width / 2 + (clamped * width) / 2, 0, 0.0005]}>
          <planeGeometry args={[clamped * width, BAR_HEIGHT]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  )
}
