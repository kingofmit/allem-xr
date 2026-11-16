'use client'

import React, { useEffect, useRef } from 'react'
import { usePhysicsContext } from '../context'
import type { RealWorldColliderProps } from '../types'
import type { Collider, RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat'

interface RealWorldColliderFullProps extends RealWorldColliderProps {
  /** Detected planes from @allem-xr/spatial usePlanes() */
  planes?: Array<{
    id: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number; w: number }
    extent: [number, number]
    polygon: Array<{ x: number; y: number; z: number }>
  }>
}

/**
 * Creates static physics colliders from detected real-world planes.
 * Pass planes from usePlanes() as a prop.
 */
export function RealWorldCollider({
  source = 'planes',
  friction = 0.8,
  restitution = 0.2,
  planes = [],
}: RealWorldColliderFullProps) {
  const { world, rapier, ready } = usePhysicsContext()
  const entriesRef = useRef<Map<string, { body: RapierRigidBody; collider: Collider }>>(new Map())

  useEffect(() => {
    if (!world || !rapier || !ready || source !== 'planes') return

    const currentIds = new Set<string>()

    for (const plane of planes) {
      currentIds.add(plane.id)

      // Skip if already created
      if (entriesRef.current.has(plane.id)) continue

      // Create a thin cuboid collider matching the plane extent
      const [width, height] = plane.extent
      if (width === 0 || height === 0) continue

      const bodyDesc = rapier.RigidBodyDesc.fixed()
        .setTranslation(plane.position.x, plane.position.y, plane.position.z)
        .setRotation({
          x: plane.rotation.x,
          y: plane.rotation.y,
          z: plane.rotation.z,
          w: plane.rotation.w,
        })

      const body = world.createRigidBody(bodyDesc)

      const colliderDesc = rapier.ColliderDesc.cuboid(width / 2, 0.005, height / 2)
        .setFriction(friction)
        .setRestitution(restitution)

      const collider = world.createCollider(colliderDesc, body)
      entriesRef.current.set(plane.id, { body, collider })
    }

    // Remove bodies (and their colliders) for planes that no longer exist
    for (const [id, entry] of entriesRef.current) {
      if (!currentIds.has(id)) {
        try { world.removeRigidBody(entry.body) } catch {}
        entriesRef.current.delete(id)
      }
    }
  }, [world, rapier, ready, planes, friction, restitution, source])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!world) return
      for (const [, entry] of entriesRef.current) {
        try { world.removeRigidBody(entry.body) } catch {}
      }
      entriesRef.current.clear()
    }
  }, [world])

  return null // No visual output
}
