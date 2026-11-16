'use client'

import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { GazePointerProps } from '../types'

/**
 * A gaze cursor that follows the camera's forward direction.
 * Shows a ring at a fixed distance from the camera.
 */
export function GazePointer({
  size = 0.005,
  distance = 1,
  color = 'white',
  visible = true,
}: GazePointerProps) {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (!groupRef.current) return
    // Position pointer at camera forward direction
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).addScaledVector(dir, distance)
    groupRef.current.lookAt(camera.position)
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      <mesh>
        <ringGeometry args={[size * 0.6, size, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
    </group>
  )
}
