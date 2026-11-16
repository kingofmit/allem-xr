'use client'

import React, { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { PassthroughWindowProps } from '../types'

/**
 * A window showing passthrough (real world) through VR.
 * Uses depth-only rendering to create a hole in VR content
 * where the XR compositor can show passthrough.
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

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: THREE.DoubleSide,
      // Stencil: clear the stencil where this window is, so the
      // XR compositor can show passthrough behind it
      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilZPass: THREE.ReplaceStencilOp,
    }),
    []
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return (
    <mesh geometry={geometry} material={material} position={position} renderOrder={-1} />
  )
}
