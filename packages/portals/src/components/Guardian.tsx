'use client'

import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { GuardianProps } from '../types'

// Cached vector for distance calculation
const _cameraPos = new THREE.Vector3()

/**
 * Guardian boundary — shows play area limits with distance-based opacity.
 * Becomes visible as the user approaches the boundary edge.
 */
export function Guardian({
  radius = 2,
  color = '#ff3333',
  opacity = 0.5,
  fadeDistance = 0.5,
  segments = 64,
  height = 2.5,
  onBreach,
  visible = true,
}: GuardianProps) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const onBreachRef = useRef(onBreach)
  onBreachRef.current = onBreach
  const wasBreachedRef = useRef(false)

  const geometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, height, segments, 1, true),
    [radius, height, segments]
  )

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [color]
  )

  useFrame(() => {
    if (!meshRef.current || !visible) {
      if (meshRef.current) meshRef.current.visible = false
      return
    }

    // Calculate distance from camera to boundary
    _cameraPos.set(camera.position.x, 0, camera.position.z)
    const dist = _cameraPos.length() // Distance from center

    const distToBoundary = radius - dist
    const isNear = distToBoundary < fadeDistance

    if (isNear) {
      meshRef.current.visible = true
      // Fade in as user approaches boundary
      const t = 1 - Math.max(0, distToBoundary / fadeDistance)
      material.opacity = t * opacity
    } else {
      meshRef.current.visible = false
      material.opacity = 0
    }

    // Breach detection
    const isBreached = dist > radius
    if (isBreached && !wasBreachedRef.current) {
      onBreachRef.current?.()
    }
    wasBreachedRef.current = isBreached
  })

  if (!visible) return null

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, height / 2, 0]}
      visible={false}
    />
  )
}
