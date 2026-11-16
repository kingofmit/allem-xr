'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useSceneMesh } from '../hooks/useSceneMesh'

/**
 * Renders scene mesh as invisible occluders.
 * Virtual objects behind real-world surfaces are hidden.
 */
export function SceneMeshOccluder() {
  const { meshes, supported } = useSceneMesh()

  const occluderMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: THREE.DoubleSide,
    }),
    []
  )

  if (!supported || meshes.length === 0) return null

  return (
    <>
      {meshes.map(meshData => (
        <mesh
          key={meshData.id}
          geometry={meshData.geometry}
          material={occluderMaterial}
          renderOrder={-1}
        />
      ))}
    </>
  )
}
