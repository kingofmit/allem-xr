'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import type { PlaneOverlayProps } from '../types'
import { usePlanes } from '../hooks/usePlanes'

extend({ Mesh: THREE.Mesh, ShapeGeometry: THREE.ShapeGeometry, MeshBasicMaterial: THREE.MeshBasicMaterial })

/**
 * Renders semi-transparent overlays on detected planes.
 */
export function PlaneOverlay({
  filter = 'all',
  color = '#4488ff',
  opacity = 0.3,
  showLabels = false,
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

  return (
    <>
      {planes.map(plane => {
        // Build shape from polygon
        if (plane.polygon.length < 3) return null

        const shape = new THREE.Shape()
        shape.moveTo(plane.polygon[0].x, plane.polygon[0].z)
        for (let i = 1; i < plane.polygon.length; i++) {
          shape.lineTo(plane.polygon[i].x, plane.polygon[i].z)
        }
        shape.closePath()

        const geometry = new THREE.ShapeGeometry(shape)

        return (
          <mesh
            key={plane.id}
            geometry={geometry}
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
