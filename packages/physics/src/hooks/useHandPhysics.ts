'use client'

import { useEffect, useRef } from 'react'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import { usePhysicsContext } from '../context'
import type { RigidBody as RapierRigidBody, Collider } from '@dimforge/rapier3d-compat'

interface UseHandPhysicsOptions {
  hand: 'left' | 'right'
  /** Radius of hand joint colliders. Default: 0.015 */
  jointRadius?: number
}

const PHYSICS_JOINTS = [
  'wrist',
  'thumb-tip',
  'index-finger-tip',
  'middle-finger-tip',
  'ring-finger-tip',
  'pinky-finger-tip',
] as const

/**
 * Create kinematic physics bodies at hand joint positions.
 * Allows hands to push and interact with physics objects.
 */
export function useHandPhysics(options: UseHandPhysicsOptions) {
  const { hand, jointRadius = 0.015 } = options
  const xrCtx = useXRContext()
  const { world, rapier, ready } = usePhysicsContext()
  const bodiesRef = useRef<Map<string, RapierRigidBody>>(new Map())

  // Create kinematic bodies for key joints
  useEffect(() => {
    if (!world || !rapier || !ready) return

    for (const jointName of PHYSICS_JOINTS) {
      const bodyDesc = rapier.RigidBodyDesc.kinematicPositionBased()
      const body = world.createRigidBody(bodyDesc)

      const colliderDesc = rapier.ColliderDesc.ball(jointRadius)
        .setRestitution(0.1)
        .setFriction(0.9)
      world.createCollider(colliderDesc, body)

      bodiesRef.current.set(jointName, body)
    }

    return () => {
      for (const [, body] of bodiesRef.current) {
        if (world.bodies.contains(body.handle)) {
          world.removeRigidBody(body)
        }
      }
      bodiesRef.current.clear()
    }
  }, [world, rapier, ready, jointRadius])

  // Update kinematic positions each frame
  useXRFrame((frame, _delta, referenceSpace) => {
    if (!world || !ready) return

    const xrState = xrCtx.getFrameState()

    // Find the hand input source
    let xrHand: XRHand | null = null
    for (const input of xrState.inputSources) {
      if (input.handedness === hand && input.hand) {
        xrHand = input.hand
        break
      }
    }

    for (const jointName of PHYSICS_JOINTS) {
      const body = bodiesRef.current.get(jointName)
      if (!body) continue

      if (!xrHand) {
        // Move bodies far away when hand not tracked
        body.setNextKinematicTranslation({ x: 0, y: -100, z: 0 })
        continue
      }

      const jointSpace = xrHand.get(jointName as XRHandJoint)
      if (!jointSpace) continue

      const pose = frame.getJointPose?.(jointSpace, referenceSpace)
      if (pose) {
        body.setNextKinematicTranslation({
          x: pose.transform.position.x,
          y: pose.transform.position.y,
          z: pose.transform.position.z,
        })
        body.setNextKinematicRotation({
          x: pose.transform.orientation.x,
          y: pose.transform.orientation.y,
          z: pose.transform.orientation.z,
          w: pose.transform.orientation.w,
        })
      }
    }
  })
}
