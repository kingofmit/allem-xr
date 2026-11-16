'use client'

import { useRef } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { usePhysicsContext } from '../context'
import type { CollisionEvent } from '../types'

interface UseCollisionOptions {
  onCollisionEnter?: (event: CollisionEvent) => void
}

/**
 * Detect collisions for a named rigid body.
 * Uses Rapier's contactPairsWith to detect contacts each frame.
 */
export function useCollision(bodyName: string, options: UseCollisionOptions) {
  const { world, ready, bodies } = usePhysicsContext()
  const optionsRef = useRef(options)
  optionsRef.current = options
  const activeContactsRef = useRef<Set<number>>(new Set())

  useFrame(() => {
    if (!world || !ready) return

    const body = bodies.get(bodyName)
    if (!body) return

    const newContacts = new Set<number>()
    const numColliders = body.numColliders()

    for (let ci = 0; ci < numColliders; ci++) {
      const collider = body.collider(ci)

      world.contactPairsWith(collider, (otherCollider: any) => {
        const otherBody = otherCollider.parent()
        if (!otherBody || otherBody.handle === body.handle) return

        newContacts.add(otherBody.handle)

        if (!activeContactsRef.current.has(otherBody.handle)) {
          let otherName = ''
          for (const [name, b] of bodies) {
            if (b.handle === otherBody.handle) {
              otherName = name
              break
            }
          }

          const pos = otherBody.translation()
          optionsRef.current.onCollisionEnter?.({
            other: otherName,
            contactPoint: new Vector3(pos.x, pos.y, pos.z),
            normal: new Vector3(0, 1, 0),
            impulse: 0,
          })
        }
      })
    }

    activeContactsRef.current = newContacts
  })
}
