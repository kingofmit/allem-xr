'use client'

import { useRef } from 'react'
import { Vector3, type Object3D } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'

interface GrabInteractionOptions {
  onGrab?: (hand: 'left' | 'right', position: Vector3) => void
  onMove?: (hand: 'left' | 'right', position: Vector3, velocity: Vector3) => void
  onRelease?: (hand: 'left' | 'right', velocity: Vector3) => void
  /** Grab detection threshold (finger curl). Default: 0.7 */
  threshold?: number
  /** Max distance from mesh to initiate grab. Default: 0.1 */
  grabDistance?: number
}

const _wristPos = new Vector3()
const _prevWristPos = new Vector3()
const _velocity = new Vector3()
const _meshPos = new Vector3()

/**
 * Detect grab interactions on a mesh.
 * Calculates release velocity for throwing.
 */
export function useGrabInteraction(
  meshRef: React.RefObject<Object3D>,
  options: GrabInteractionOptions
) {
  const ctx = useXRContext()
  const optionsRef = useRef(options)
  optionsRef.current = options
  const threshold = options.threshold ?? 0.7
  const grabDistance = options.grabDistance ?? 0.1

  const grabbingRef = useRef<{ hand: 'left' | 'right'; prevPos: Vector3 } | null>(null)
  // Track velocity over last few frames for smooth release
  const velocityHistoryRef = useRef<Vector3[]>([])

  useXRFrame((frame, delta, referenceSpace) => {
    const state = ctx.getFrameState()
    const mesh = meshRef.current
    if (!mesh) return

    for (const input of state.inputSources) {
      if (!input.hand || (input.handedness !== 'left' && input.handedness !== 'right')) continue
      const hand = input.handedness as 'left' | 'right'

      // Get wrist position
      const wristSpace = input.hand.get('wrist' as XRHandJoint)
      if (!wristSpace) continue
      const wristPose = frame.getJointPose?.(wristSpace, referenceSpace)
      if (!wristPose) continue

      _wristPos.set(
        wristPose.transform.position.x,
        wristPose.transform.position.y,
        wristPose.transform.position.z
      )

      // Simple grab detection: check if fingers are curled
      // We check index + middle finger tips vs metacarpals
      let curl = 0
      let count = 0
      for (const finger of ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']) {
        const tipSpace = input.hand.get(`${finger}-tip` as XRHandJoint)
        const metaSpace = input.hand.get(`${finger}-metacarpal` as XRHandJoint)
        if (!tipSpace || !metaSpace) continue

        const tipPose = frame.getJointPose?.(tipSpace, referenceSpace)
        const metaPose = frame.getJointPose?.(metaSpace, referenceSpace)
        if (!tipPose || !metaPose) continue

        const tipDist = Math.sqrt(
          (tipPose.transform.position.x - wristPose.transform.position.x) ** 2 +
          (tipPose.transform.position.y - wristPose.transform.position.y) ** 2 +
          (tipPose.transform.position.z - wristPose.transform.position.z) ** 2
        )
        const metaDist = Math.sqrt(
          (metaPose.transform.position.x - wristPose.transform.position.x) ** 2 +
          (metaPose.transform.position.y - wristPose.transform.position.y) ** 2 +
          (metaPose.transform.position.z - wristPose.transform.position.z) ** 2
        )

        const fullLength = metaDist * 2.5
        curl += Math.max(0, Math.min(1, 1 - tipDist / fullLength))
        count++
      }

      const avgCurl = count > 0 ? curl / count : 0
      const isGrabbing = avgCurl > threshold

      if (isGrabbing) {
        if (!grabbingRef.current || grabbingRef.current.hand !== hand) {
          // Check if near mesh
          mesh.getWorldPosition(_meshPos)
          if (_wristPos.distanceTo(_meshPos) < grabDistance) {
            grabbingRef.current = { hand, prevPos: _wristPos.clone() }
            velocityHistoryRef.current = []
            optionsRef.current.onGrab?.(hand, _wristPos.clone())
          }
        } else if (grabbingRef.current.hand === hand) {
          // Track velocity
          _velocity.subVectors(_wristPos, grabbingRef.current.prevPos)
          if (delta > 0) _velocity.divideScalar(delta)

          velocityHistoryRef.current.push(_velocity.clone())
          if (velocityHistoryRef.current.length > 5) velocityHistoryRef.current.shift()

          grabbingRef.current.prevPos.copy(_wristPos)
          optionsRef.current.onMove?.(hand, _wristPos.clone(), _velocity.clone())
        }
      } else if (grabbingRef.current?.hand === hand) {
        // Release — average velocity over recent frames
        const avgVel = new Vector3()
        for (const v of velocityHistoryRef.current) {
          avgVel.add(v)
        }
        if (velocityHistoryRef.current.length > 0) {
          avgVel.divideScalar(velocityHistoryRef.current.length)
        }
        optionsRef.current.onRelease?.(hand, avgVel)
        grabbingRef.current = null
        velocityHistoryRef.current = []
      }
    }
  })
}
