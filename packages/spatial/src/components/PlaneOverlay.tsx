'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { PlaneOverlayProps } from '../types'
import { usePlanes } from '../hooks/usePlanes'

/**
 * Renders semi-transparent overlays on detected planes.
 */
export function PlaneOverlay({
  filter = 'all',
  color = '#4488ff',
  opacity = 0.3,
}: PlaneOverlayProps) {
  const { planes } = usePlanes({ filter })

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    [color, opacity]
  )

  // Build and cache geometries — only rebuild when planes change
  const prevGeometriesRef = useRef<Map<string, THREE.ShapeGeometry>>(new Map())

  const geometries = useMemo(() => {
    const newMap = new Map<string, THREE.ShapeGeometry>()

    for (const plane of planes) {
      if (plane.polygon.length < 3) continue

      // Reuse existing geometry if plane ID matches
      const existing = prevGeometriesRef.current.get(plane.id)
      if (existing) {
        newMap.set(plane.id, existing)
        continue
      }

      const shape = new THREE.Shape()
      shape.moveTo(plane.polygon[0].x, plane.polygon[0].z)
      for (let i = 1; i < plane.polygon.length; i++) {
        shape.lineTo(plane.polygon[i].x, plane.polygon[i].z)
      }
      shape.closePath()
      newMap.set(plane.id, new THREE.ShapeGeometry(shape))
    }

    // Dispose removed geometries
    for (const [id, geo] of prevGeometriesRef.current) {
      if (!newMap.has(id)) {
        geo.dispose()
      }
    }

    prevGeometriesRef.current = newMap
    return newMap
  }, [planes])

  // Dispose all on unmount
  useEffect(() => {
    return () => {
      for (const geo of prevGeometriesRef.current.values()) {
        geo.dispose()
      }
      prevGeometriesRef.current.clear()
    }
  }, [])

  return (
    <>
      {planes.map(plane => {
        const geo = geometries.get(plane.id)
        if (!geo) return null

        return (
          <mesh
            key={plane.id}
            geometry={geo}
            material={material}
            position={plane.position}
            quaternion={plane.rotation}
            rotation-x={-Math.PI / 2}
          />
        )
      })}
    </>
  )
}
