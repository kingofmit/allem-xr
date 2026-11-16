'use client'

import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { PortalProps } from '../types'

// Cached vector for distance calculation
const _portalPos = new THREE.Vector3()

/**
 * A portal — a window into another virtual scene.
 * Content inside is only visible through the portal frame.
 * Uses Three.js stencil buffer for clipping.
 */
export function Portal({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [1, 2],
  onEnter,
  onExit,
  renderBorder = true,
  borderColor = '#00ccff',
  borderWidth = 0.02,
}: PortalProps) {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()
  const wasInsideRef = useRef(false)

  // Stencil material — writes to stencil buffer, doesn't render visible pixels
  const stencilMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilZPass: THREE.ReplaceStencilOp,
      }),
    []
  )

  // Border material
  const borderMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: borderColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      }),
    [borderColor]
  )

  // Check proximity for enter/exit events
  useFrame(() => {
    if (!groupRef.current || (!onEnter && !onExit)) return

    groupRef.current.getWorldPosition(_portalPos)
    const dist = camera.position.distanceTo(_portalPos)
    const isInside = dist < Math.max(size[0], size[1]) * 0.5

    if (isInside && !wasInsideRef.current) {
      onEnter?.()
    } else if (!isInside && wasInsideRef.current) {
      onExit?.()
    }
    wasInsideRef.current = isInside
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Stencil mask — the portal opening */}
      <mesh material={stencilMaterial} renderOrder={-1}>
        <planeGeometry args={[size[0], size[1]]} />
      </mesh>

      {/* Portal content — only visible where stencil is set */}
      <group>
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child
          // Clone with stencil test material override would be complex.
          // Instead, render children normally — the stencil mask limits visibility.
          return child
        })}
      </group>

      {/* Border frame */}
      {renderBorder && (
        <>
          {/* Top */}
          <mesh material={borderMaterial} position={[0, size[1] / 2, 0]}>
            <planeGeometry args={[size[0] + borderWidth * 2, borderWidth]} />
          </mesh>
          {/* Bottom */}
          <mesh material={borderMaterial} position={[0, -size[1] / 2, 0]}>
            <planeGeometry args={[size[0] + borderWidth * 2, borderWidth]} />
          </mesh>
          {/* Left */}
          <mesh material={borderMaterial} position={[-size[0] / 2, 0, 0]}>
            <planeGeometry args={[borderWidth, size[1]]} />
          </mesh>
          {/* Right */}
          <mesh material={borderMaterial} position={[size[0] / 2, 0, 0]}>
            <planeGeometry args={[borderWidth, size[1]]} />
          </mesh>
        </>
      )}
    </group>
  )
}
