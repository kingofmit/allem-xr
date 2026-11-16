'use client'

import { useRef } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { usePhysicsContext } from '../context'
import type { CollisionEvent } from '../types'

interface UseCollisionOptions {
  onCollisionEnter?: (event: CollisionEvent) => void
  onCollisionExit?: (event: CollisionEvent) => void
}

// Cached vectors
const _contactPoint = new Vector3()
const _normal = new Vector3()

/**
 * Detect collisions for a named rigid body.
 * Fires onCollisionEnter when a new contact begins, onCollisionExit when it ends.
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
          // Find other body name via reverse lookup
          let otherName = ''
          for (const [name, b] of bodies) {
            if (b.handle === otherBody.handle) {
              otherName = name
              break
            }
          }

          // Get actual contact data from manifold
          let impulse = 0
          _contactPoint.set(0, 0, 0)
          _normal.set(0, 1, 0)

          try {
            world.contactPair(collider, otherCollider, (manifold: any, flipped: boolean) => {
              const numContacts = manifold.numContacts()
              if (numContacts > 0) {
                const localPoint = flipped ? manifold.localContactPoint2(0) : manifold.localContactPoint1(0)
                if (localPoint) {
                  const bodyPos = body.translation()
                  _contactPoint.set(
                    bodyPos.x + localPoint.x,
                    bodyPos.y + localPoint.y,
                    bodyPos.z + localPoint.z
                  )
                }
                const localNormal = flipped ? manifold.localNormal2() : manifold.localNormal1()
                if (localNormal) {
                  _normal.set(localNormal.x, localNormal.y, localNormal.z)
                }
                impulse = Math.abs(manifold.contactImpulse(0) ?? 0)
              }
            })
          } catch {
            // contactPair may not be available for all collider pairs
          }

          optionsRef.current.onCollisionEnter?.({
            other: otherName,
            contactPoint: _contactPoint.clone(),
            normal: _normal.clone(),
            impulse,
          })
        }
      })
    }

    // Fire exit events for contacts that ended
    for (const handle of activeContactsRef.current) {
      if (!newContacts.has(handle)) {
        let otherName = ''
        for (const [name, b] of bodies) {
          if (b.handle === handle) {
            otherName = name
            break
          }
        }
        optionsRef.current.onCollisionExit?.({
          other: otherName,
          contactPoint: new Vector3(),
          normal: new Vector3(0, 1, 0),
          impulse: 0,
        })
      }
    }

    activeContactsRef.current = newContacts
  })
}
