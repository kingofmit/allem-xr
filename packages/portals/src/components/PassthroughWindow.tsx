'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { PassthroughWindowProps } from '../types'

/**
 * A window showing passthrough (real world) through VR.
 * Uses stencil buffer to create a hole in VR content.
 * Requires XR compositor passthrough support.
 */
export function PassthroughWindow({
  position = [0, 1.5, -1],
  size = [0.5, 0.5],
  shape = 'rectangle',
}: PassthroughWindowProps) {
  const geometry = useMemo(() => {
    if (shape === 'circle') {
      return new THREE.CircleGeometry(size[0] / 2, 32)
    }
    return new THREE.PlaneGeometry(size[0], size[1])
  }, [shape, size[0], size[1]])

  // Passthrough material — renders as transparent hole
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
        side: THREE.DoubleSide,
      }),
    []
  )

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      renderOrder={-1}
    />
  )
}
