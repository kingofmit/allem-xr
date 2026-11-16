'use client'


import React, { useRef, useCallback, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SpatialText } from './SpatialText'
import type { SliderProps } from '../types'

const TRACK_HEIGHT = 0.006
const THUMB_RADIUS = 0.01

/**
 * A draggable slider for numeric values.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  width = 0.2,
  label,
  trackColor = '#444444',
  fillColor = '#4488ff',
  position = [0, 0, 0],
}: SliderProps) {
  const trackRef = useRef<THREE.Mesh>(null)
  const [dragging, setDragging] = useState(false)

  // Clean up drag state on unmount
  useEffect(() => {
    return () => {
      setDragging(false)
    }
  }, [])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const thumbX = -width / 2 + normalized * width

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation()
    setDragging(true)
    ;(e.target as any)?.setPointerCapture?.(e.pointerId)
  }, [])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handlePointerMove = useCallback((e: any) => {
    if (!dragging || !trackRef.current) return
    // Get local X position on track
    const localPoint = trackRef.current.worldToLocal(e.point.clone())
    const normalized = Math.max(0, Math.min(1, (localPoint.x + width / 2) / width))
    let newValue = min + normalized * (max - min)
    // Snap to step
    newValue = Math.round(newValue / step) * step
    newValue = Math.max(min, Math.min(max, newValue))
    onChangeRef.current(newValue)
  }, [dragging, width, min, max, step])

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
          position={[-width / 2, TRACK_HEIGHT + 0.008, 0]}
        />
      )}

      {/* Value display */}
      <SpatialText
        text={value.toFixed(2)}
        fontSize={0.011}
        color="#cccccc"
        anchorX="right"
        anchorY="bottom"
        position={[width / 2, TRACK_HEIGHT + 0.008, 0]}
      />

      {/* Track background */}
      <mesh
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[width, TRACK_HEIGHT]} />
        <meshBasicMaterial color={trackColor} />
      </mesh>

      {/* Fill */}
      <mesh position={[-width / 2 + (normalized * width) / 2, 0, 0.0005]}>
        <planeGeometry args={[normalized * width, TRACK_HEIGHT]} />
        <meshBasicMaterial color={fillColor} />
      </mesh>

      {/* Thumb */}
      <mesh position={[thumbX, 0, 0.001]}>
        <circleGeometry args={[THUMB_RADIUS, 16]} />
        <meshBasicMaterial color={dragging ? '#ffffff' : fillColor} />
      </mesh>
    </group>
  )
}
