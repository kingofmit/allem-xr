'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { SceneTransitionProps } from '../types'

/**
 * Full-screen transition effect (fade to color).
 * Renders a screen-space quad in front of the camera.
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
  const directionRef = useRef<'in' | 'out'>('in')
  const startTimeRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (active) {
      directionRef.current = 'in'
      startTimeRef.current = performance.now()
      progressRef.current = 0
    } else if (progressRef.current > 0) {
      directionRef.current = 'out'
      startTimeRef.current = performance.now()
    }
  }, [active])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const elapsed = performance.now() - startTimeRef.current
    const durationMs = duration / 2 // half for fade in, half for fade out
    const t = Math.min(1, elapsed / durationMs)

    if (directionRef.current === 'in') {
      progressRef.current = t
      if (t >= 1 && directionRef.current === 'in') {
        directionRef.current = 'out'
        startTimeRef.current = performance.now()
        onCompleteRef.current?.()
      }
    } else {
      progressRef.current = 1 - t
    }

    const mat = mesh.material as THREE.MeshBasicMaterial
    mat.opacity = progressRef.current
    mesh.visible = progressRef.current > 0.001

    // Keep quad in front of camera
    mesh.position.copy(camera.position)
    mesh.quaternion.copy(camera.quaternion)
    mesh.translateZ(-0.1) // Just in front of near plane
  })

  return (
    <mesh ref={meshRef} renderOrder={9999} visible={false}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
