'use client'

import React, { useRef, forwardRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import type { PanelProps } from '../types'

/**
 * A floating panel — the fundamental spatial UI container.
 */
export const Panel = forwardRef<Group, PanelProps>(function Panel(
  {
    children,
    position = [0, 0, 0],
    width = 0.4,
    height = 0.3,
    followGaze = false,
    backgroundColor = '#111111',
    backgroundOpacity = 0.85,
    borderRadius = 0.01,
    padding = 0.01,
    visible = true,
  },
  ref
) {
  const groupRef = useRef<Group>(null)
  const mergedRef = (ref as React.MutableRefObject<Group>) || groupRef
  const { camera } = useThree()

  // Billboard toward camera each frame
  useFrame(() => {
    if (followGaze && mergedRef.current) {
      mergedRef.current.lookAt(camera.position)
    }
  })

  if (!visible) return null

  return (
    <group ref={mergedRef} position={position}>
      {/* Background plane */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color={backgroundColor}
          transparent
          opacity={backgroundOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Content — offset forward slightly to avoid z-fighting */}
      <group position={[0, 0, 0.001]}>
        {children}
      </group>
    </group>
  )
})
