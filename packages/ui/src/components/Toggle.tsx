'use client'


import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SpatialText } from './SpatialText'
import type { ToggleProps } from '../types'

const TRACK_W = 0.04
const TRACK_H = 0.02
const THUMB_R = 0.009

/**
 * A toggle switch for boolean values.
 */
export function Toggle({
  checked,
  onChange,
  label,
  activeColor = '#4488ff',
  inactiveColor = '#666666',
  position = [0, 0, 0],
}: ToggleProps) {
  const thumbXRef = useRef(checked ? TRACK_W / 4 : -TRACK_W / 4)

  useFrame((_s, delta) => {
    const target = checked ? TRACK_W / 4 : -TRACK_W / 4
    thumbXRef.current += (target - thumbXRef.current) * Math.min(1, 15 * delta)
  })

  return (
    <group position={position}>
      {/* Track */}
      <mesh onClick={() => onChange(!checked)}>
        <planeGeometry args={[TRACK_W, TRACK_H]} />
        <meshBasicMaterial color={checked ? activeColor : inactiveColor} transparent opacity={0.8} />
      </mesh>

      {/* Thumb — updated imperatively via ref */}
      <mesh position-x={thumbXRef.current} position-z={0.001}>
        <circleGeometry args={[THUMB_R, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Label */}
      {label && (
        <SpatialText
          text={label}
          fontSize={0.013}
          color="#cccccc"
          anchorX="left"
          anchorY="middle"
          position={[TRACK_W / 2 + 0.01, 0, 0]}
        />
      )}
    </group>
  )
}
