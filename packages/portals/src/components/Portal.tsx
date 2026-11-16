'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { PortalProps } from '../types'

const _portalPos = new THREE.Vector3()

// Stencil ref value for this portal
const STENCIL_REF = 1

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
  const contentRef = useRef<Group>(null)
  const { camera } = useThree()
  const wasInsideRef = useRef(false)

  // Stencil mask material — writes stencil, doesn't render pixels
  const stencilWriteMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: STENCIL_REF,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilZPass: THREE.ReplaceStencilOp,
      stencilFail: THREE.KeepStencilOp,
      stencilZFail: THREE.KeepStencilOp,
    }),
    []
  )

  // Border material
  const borderMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: borderColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    }),
    [borderColor]
  )

  // Memoize border geometries
  const borderGeos = useMemo(() => ({
    top: new THREE.PlaneGeometry(size[0] + borderWidth * 2, borderWidth),
    bottom: new THREE.PlaneGeometry(size[0] + borderWidth * 2, borderWidth),
    left: new THREE.PlaneGeometry(borderWidth, size[1]),
    right: new THREE.PlaneGeometry(borderWidth, size[1]),
  }), [size[0], size[1], borderWidth])

  // Apply stencil TEST to all child meshes so they only render inside the portal
  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    content.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const mat of materials) {
          mat.stencilWrite = false
          mat.stencilRef = STENCIL_REF
          mat.stencilFunc = THREE.EqualStencilFunc
          mat.stencilFail = THREE.KeepStencilOp
          mat.stencilZFail = THREE.KeepStencilOp
          mat.stencilZPass = THREE.KeepStencilOp
          mat.needsUpdate = true
        }
      }
    })
  })

  // Proximity detection for enter/exit events
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

  // Cleanup
  useEffect(() => {
    return () => {
      stencilWriteMaterial.dispose()
      borderMaterial.dispose()
      borderGeos.top.dispose()
      borderGeos.bottom.dispose()
      borderGeos.left.dispose()
      borderGeos.right.dispose()
    }
  }, [stencilWriteMaterial, borderMaterial, borderGeos])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Stencil mask — the portal opening. Render first. */}
      <mesh material={stencilWriteMaterial} renderOrder={0}>
        <planeGeometry args={[size[0], size[1]]} />
      </mesh>

      {/* Portal content — stencil tested, only visible through mask */}
      <group ref={contentRef} renderOrder={1}>
        {children}
      </group>

      {/* Border frame */}
      {renderBorder && (
        <>
          <mesh material={borderMaterial} geometry={borderGeos.top} position={[0, size[1] / 2, 0]} />
          <mesh material={borderMaterial} geometry={borderGeos.bottom} position={[0, -size[1] / 2, 0]} />
          <mesh material={borderMaterial} geometry={borderGeos.left} position={[-size[0] / 2, 0, 0]} />
          <mesh material={borderMaterial} geometry={borderGeos.right} position={[size[0] / 2, 0, 0]} />
        </>
      )}
    </group>
  )
}
