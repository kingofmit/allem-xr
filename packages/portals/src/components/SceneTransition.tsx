'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { SceneTransitionProps } from '../types'

/**
 * Full-screen transition effect (fade to color).
 * When active becomes true: fades in over duration/2, fires onComplete, then fades out over duration/2.
 */
export function SceneTransition({
  active,
  duration = 500,
  effect = 'fade',
  color = '#000000',
  onComplete,
}: SceneTransitionProps) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)
  const phaseRef = useRef<'idle' | 'fade-in' | 'fade-out'>('idle')
  const startTimeRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const geometry = useMemo(() => new THREE.PlaneGeometry(10, 10), [])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    [color]
  )

  // Trigger transition on active change
  useEffect(() => {
    if (active) {
      phaseRef.current = 'fade-in'
      startTimeRef.current = performance.now()
    }
  }, [active])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh || phaseRef.current === 'idle') {
      if (mesh) mesh.visible = false
      return
    }

    const halfDuration = duration / 2
    const elapsed = performance.now() - startTimeRef.current

    if (phaseRef.current === 'fade-in') {
      progressRef.current = Math.min(1, elapsed / halfDuration)
      if (progressRef.current >= 1) {
        onCompleteRef.current?.()
        phaseRef.current = 'fade-out'
        startTimeRef.current = performance.now()
      }
    } else if (phaseRef.current === 'fade-out') {
      progressRef.current = Math.max(0, 1 - elapsed / halfDuration)
      if (progressRef.current <= 0) {
        phaseRef.current = 'idle'
      }
    }

    material.opacity = progressRef.current
    mesh.visible = progressRef.current > 0.001

    // Track camera
    mesh.position.copy(camera.position)
    mesh.quaternion.copy(camera.quaternion)
    mesh.translateZ(-0.1)
  })

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <mesh ref={meshRef} geometry={geometry} material={material} renderOrder={9999} visible={false} />
}
