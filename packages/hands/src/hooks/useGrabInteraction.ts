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
const _velocity = new Vector3()
const _meshPos = new Vector3()
const _grabOutPos = new Vector3()
const _grabOutVel = new Vector3()
const _avgVel = new Vector3()

const VELOCITY_BUFFER_SIZE = 5

/**
 * Detect grab interactions on a mesh.
 * Calculates release velocity for throwing.
 * Supports both hands simultaneously.
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

  // Per-hand grab state with pre-allocated vectors
  const grabbingRef = useRef<Map<'left' | 'right', { prevPos: Vector3 }>>(new Map())

  // Per-hand velocity ring buffers with pre-allocated vectors
  const velocityBufferRef = useRef<Map<'left' | 'right', { buffer: Vector3[]; index: number }>>(new Map())

  function getVelocityBuffer(hand: 'left' | 'right') {
    let entry = velocityBufferRef.current.get(hand)
    if (!entry) {
      entry = {
        buffer: Array.from({ length: VELOCITY_BUFFER_SIZE }, () => new Vector3()),
        index: 0,
      }
      velocityBufferRef.current.set(hand, entry)
    }
    return entry
  }

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

      // Grab detection: check finger curl using proximal-to-tip vs metacarpal distance
      let curl = 0
      let count = 0
      for (const finger of ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']) {
        const tipSpace = input.hand.get(`${finger}-tip` as XRHandJoint)
        const proxSpace = input.hand.get(`${finger}-phalanx-proximal` as XRHandJoint)
        const metaSpace = input.hand.get(`${finger}-metacarpal` as XRHandJoint)
        if (!tipSpace || !proxSpace || !metaSpace) continue

        const tipPose = frame.getJointPose?.(tipSpace, referenceSpace)
        const proxPose = frame.getJointPose?.(proxSpace, referenceSpace)
        const metaPose = frame.getJointPose?.(metaSpace, referenceSpace)
        if (!tipPose || !proxPose || !metaPose) continue

        // Tip-to-metacarpal distance vs proximal-to-metacarpal distance
        const tipDist = Math.sqrt(
          (tipPose.transform.position.x - metaPose.transform.position.x) ** 2 +
          (tipPose.transform.position.y - metaPose.transform.position.y) ** 2 +
          (tipPose.transform.position.z - metaPose.transform.position.z) ** 2
        )
        const fullLength = Math.sqrt(
          (proxPose.transform.position.x - metaPose.transform.position.x) ** 2 +
          (proxPose.transform.position.y - metaPose.transform.position.y) ** 2 +
          (proxPose.transform.position.z - metaPose.transform.position.z) ** 2
        ) * 2.5

        curl += Math.max(0, Math.min(1, 1 - tipDist / fullLength))
        count++
      }

      const avgCurl = count > 0 ? curl / count : 0
      const isGrabbing = avgCurl > threshold

      const grabState = grabbingRef.current.get(hand)

      if (isGrabbing) {
        if (!grabState) {
          // Check if near mesh
          mesh.getWorldPosition(_meshPos)
          if (_wristPos.distanceTo(_meshPos) < grabDistance) {
            grabbingRef.current.set(hand, { prevPos: new Vector3().copy(_wristPos) })
            const velBuf = getVelocityBuffer(hand)
            velBuf.index = 0
            _grabOutPos.copy(_wristPos)
            optionsRef.current.onGrab?.(hand, _grabOutPos)
          }
        } else {
          // Track velocity
          _velocity.subVectors(_wristPos, grabState.prevPos)
          if (delta > 0) _velocity.divideScalar(delta)

          const velBuf = getVelocityBuffer(hand)
          velBuf.buffer[velBuf.index % VELOCITY_BUFFER_SIZE].copy(_velocity)
          velBuf.index++

          grabState.prevPos.copy(_wristPos)
          _grabOutPos.copy(_wristPos)
          _grabOutVel.copy(_velocity)
          optionsRef.current.onMove?.(hand, _grabOutPos, _grabOutVel)
        }
      } else if (grabState) {
        // Release — average velocity over recent frames
        const velBuf = getVelocityBuffer(hand)
        const sampleCount = Math.min(velBuf.index, VELOCITY_BUFFER_SIZE)
        _avgVel.set(0, 0, 0)
        for (let i = 0; i < sampleCount; i++) {
          _avgVel.add(velBuf.buffer[i])
        }
        if (sampleCount > 0) {
          _avgVel.divideScalar(sampleCount)
        }
        optionsRef.current.onRelease?.(hand, _avgVel)
        grabbingRef.current.delete(hand)
      }
    }
  })
}
