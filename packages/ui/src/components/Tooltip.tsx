'use client'


import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { SpatialText } from './SpatialText'
import type { Group } from 'three'
import type { TooltipProps } from '../types'

/**
 * A floating tooltip that follows a target object.
 */
export function Tooltip({
  text,
  target,
  offset = [0, 0.06, 0],
  visible = true,
}: TooltipProps) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!groupRef.current || !target.current) return
    const pos = target.current.getWorldPosition(new THREE.Vector3())
    groupRef.current.position.set(
      pos.x + offset[0],
      pos.y + offset[1],
      pos.z + offset[2]
    )
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {/* Background */}
      <mesh>
        <planeGeometry args={[text.length * 0.009 + 0.02, 0.025]} />
        <meshBasicMaterial color="#222222" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <SpatialText
        text={text}
        fontSize={0.012}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.001]}
      />
    </group>
  )
}
