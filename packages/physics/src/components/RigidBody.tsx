'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, BufferGeometry, Vector3 as ThreeVec3 } from 'three'
import * as THREE from 'three'
import { usePhysicsContext } from '../context'
import type { RigidBodyProps, RigidBodyType } from '../types'

function getBodyDesc(rapier: typeof import('@dimforge/rapier3d-compat'), type: RigidBodyType) {
  switch (type) {
    case 'dynamic': return rapier.RigidBodyDesc.dynamic()
    case 'fixed': return rapier.RigidBodyDesc.fixed()
    case 'kinematic-position': return rapier.RigidBodyDesc.kinematicPositionBased()
    case 'kinematic-velocity': return rapier.RigidBodyDesc.kinematicVelocityBased()
  }
}

/**
 * Wraps children in a physics-simulated rigid body.
 * The group's transform is driven by the physics engine.
 */
export function RigidBody({
  children,
  type = 'dynamic',
  mass = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  collider = 'auto',
  args,
  restitution = 0.3,
  friction = 0.7,
  linearDamping = 0.05,
  angularDamping = 0.05,
  ccd = false,
  onCollision,
  name,
}: RigidBodyProps) {
  const { world, rapier, ready, registerBody, unregisterBody } = usePhysicsContext()
  const groupRef = useRef<Group>(null)
  const bodyHandleRef = useRef<number | null>(null)
  const bodyId = useMemo(() => name ?? `body-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, [name])

  // Create rigid body and collider
  useEffect(() => {
    if (!world || !rapier || !ready) return

    // Create body
    const bodyDesc = getBodyDesc(rapier, type)
    bodyDesc.setTranslation(position[0], position[1], position[2])

    const euler = new THREE.Euler(rotation[0], rotation[1], rotation[2])
    const quat = new THREE.Quaternion().setFromEuler(euler)
    bodyDesc.setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w })

    if (type === 'dynamic') {
      bodyDesc.setLinearDamping(linearDamping)
      bodyDesc.setAngularDamping(angularDamping)
      bodyDesc.setAdditionalMass(mass)
      if (ccd) bodyDesc.setCcdEnabled(true)
    }

    const body = world.createRigidBody(bodyDesc)
    bodyHandleRef.current = body.handle
    registerBody(bodyId, body)

    // Create collider
    let colliderDesc: import('@dimforge/rapier3d-compat').ColliderDesc | null = null

    if (collider === 'auto') {
      // Infer from child geometry — find first mesh
      const group = groupRef.current
      if (group) {
        let foundMesh: Mesh | null = null
        group.traverse(child => {
          if (!foundMesh && (child as Mesh).isMesh) {
            foundMesh = child as Mesh
          }
        })

        if (foundMesh) {
          const geo = (foundMesh as Mesh).geometry
          geo.computeBoundingBox()
          const box = geo.boundingBox
          if (!box) {
            colliderDesc = rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05)
          } else {
            const size = new THREE.Vector3()
            box.getSize(size)
            colliderDesc = rapier.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
          }
        } else {
          // Fallback: unit cube
          colliderDesc = rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05)
        }
      }
    } else if (collider === 'cuboid') {
      const a = args ?? [0.05, 0.05, 0.05]
      colliderDesc = rapier.ColliderDesc.cuboid(a[0], a[1], a[2])
    } else if (collider === 'ball') {
      const r = args?.[0] ?? 0.05
      colliderDesc = rapier.ColliderDesc.ball(r)
    } else if (collider === 'capsule') {
      const halfHeight = args?.[0] ?? 0.05
      const radius = args?.[1] ?? 0.025
      colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius)
    }

    if (colliderDesc) {
      colliderDesc.setRestitution(restitution)
      colliderDesc.setFriction(friction)
      // Mass is set on the body descriptor via setAdditionalMass
      world.createCollider(colliderDesc, body)
    }

    return () => {
      unregisterBody(bodyId)
      try {
        if (world && world.bodies && world.bodies.contains(body.handle)) {
          world.removeRigidBody(body)
        }
      } catch {
        // World may already be freed
      }
    }
  }, [world, rapier, ready]) // Only create once when physics is ready

  // Sync Three.js transform from physics each frame
  useFrame(() => {
    try {
      if (!world || !ready || bodyHandleRef.current === null) return
      const group = groupRef.current
      if (!group) return

      const body = world.bodies.get(bodyHandleRef.current)
      if (!body) return

      if (type === 'dynamic' || type === 'kinematic-position' || type === 'kinematic-velocity') {
        const pos = body.translation()
        const rot = body.rotation()
        group.position.set(pos.x, pos.y, pos.z)
        group.quaternion.set(rot.x, rot.y, rot.z, rot.w)
      }
    } catch {
      // World may have been freed during unmount
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {children}
    </group>
  )
}
