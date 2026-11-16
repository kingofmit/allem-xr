'use client'

import { useRef, useState } from 'react'
import { Vector3, Quaternion, BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { SceneMeshData, SceneMeshState } from '../types'

/**
 * Access real-world scene mesh reconstruction.
 * Requires 'mesh-detection' feature in XRProvider.
 */
export function useSceneMesh(): SceneMeshState {
  const ctx = useXRContext()
  const [state, setState] = useState<SceneMeshState>({
    supported: false,
    meshes: [],
    isReconstructing: false,
  })

  const meshMapRef = useRef<Map<XRMesh, SceneMeshData>>(new Map())

  useXRFrame((frame, _delta, referenceSpace) => {
    const detectedMeshes = (frame as any).detectedMeshes as Set<XRMesh> | undefined
    if (!detectedMeshes) return

    const currentMeshes = new Map<XRMesh, SceneMeshData>()
    let changed = false

    for (const xrMesh of detectedMeshes) {
      const existing = meshMapRef.current.get(xrMesh)

      if (existing && xrMesh.lastChangedTime <= (existing as any)._lastChanged) {
        currentMeshes.set(xrMesh, existing)
        continue
      }

      changed = true
      const pose = frame.getPose(xrMesh.meshSpace, referenceSpace)
      if (!pose) continue

      // Build Three.js geometry from mesh data
      const vertices = xrMesh.vertices
      const indices = xrMesh.indices

      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
      if (indices) {
        geometry.setIndex(new Uint32BufferAttribute(indices, 1))
      }
      geometry.computeVertexNormals()

      const normals = geometry.getAttribute('normal')
        ? (geometry.getAttribute('normal') as Float32BufferAttribute).array as Float32Array
        : null

      const id = existing?.id ?? `mesh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const meshData: SceneMeshData = {
        id,
        vertices: new Float32Array(vertices),
        indices: indices ? new Uint32Array(indices) : new Uint32Array(0),
        normals,
        geometry,
        raw: xrMesh,
      }
      ;(meshData as any)._lastChanged = xrMesh.lastChangedTime

      // Dispose old geometry
      if (existing) {
        existing.geometry.dispose()
      }

      currentMeshes.set(xrMesh, meshData)
    }

    // Dispose removed meshes
    for (const [xrMesh, data] of meshMapRef.current) {
      if (!currentMeshes.has(xrMesh)) {
        data.geometry.dispose()
        changed = true
      }
    }

    meshMapRef.current = currentMeshes

    if (changed || !state.supported) {
      setState({
        supported: true,
        meshes: Array.from(currentMeshes.values()),
        isReconstructing: true,
      })
    }
  })

  return state
}
