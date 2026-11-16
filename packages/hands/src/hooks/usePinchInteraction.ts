'use client'

import { useRef, useEffect } from 'react'
import { Vector3, type Object3D } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'

interface PinchInteractionOptions {
  onPinchStart?: (hand: 'left' | 'right', position: Vector3) => void
  onPinchMove?: (hand: 'left' | 'right', position: Vector3, delta: Vector3) => void
  onPinchEnd?: (hand: 'left' | 'right') => void
}

// Cached vectors
const _thumbPos = new Vector3()
const _indexPos = new Vector3()
const _pinchPoint = new Vector3()
const _prevPinchPoint = new Vector3()
const _moveDelta = new Vector3()

const PINCH_THRESHOLD = 0.025

/**
 * Detect pinch interactions near a mesh.
 * Fires callbacks when the user pinches near the referenced object.
 */
export function usePinchInteraction(
  meshRef: React.RefObject<Object3D>,
  options: PinchInteractionOptions
) {
  const ctx = useXRContext()
  const optionsRef = useRef(options)
  optionsRef.current = options

  const pinchingRef = useRef<{ hand: 'left' | 'right'; prevPos: Vector3 } | null>(null)

  useXRFrame((frame, _delta, referenceSpace) => {
    const state = ctx.getFrameState()
    const mesh = meshRef.current
    if (!mesh) return

    for (const input of state.inputSources) {
      if (!input.hand || (input.handedness !== 'left' && input.handedness !== 'right')) continue
      const hand = input.handedness as 'left' | 'right'

      const thumbTip = input.hand.get('thumb-tip' as XRHandJoint)
      const indexTip = input.hand.get('index-finger-tip' as XRHandJoint)
      if (!thumbTip || !indexTip) continue

      const thumbPose = frame.getJointPose?.(thumbTip, referenceSpace)
      const indexPose = frame.getJointPose?.(indexTip, referenceSpace)
      if (!thumbPose || !indexPose) continue

      _thumbPos.set(thumbPose.transform.position.x, thumbPose.transform.position.y, thumbPose.transform.position.z)
      _indexPos.set(indexPose.transform.position.x, indexPose.transform.position.y, indexPose.transform.position.z)

      const distance = _thumbPos.distanceTo(_indexPos)
      const isPinching = distance < PINCH_THRESHOLD

      _pinchPoint.addVectors(_thumbPos, _indexPos).multiplyScalar(0.5)

      if (isPinching) {
        if (!pinchingRef.current || pinchingRef.current.hand !== hand) {
          // Pinch start — check if near the mesh
          const meshPos = new Vector3()
          mesh.getWorldPosition(meshPos)
          const distToMesh = _pinchPoint.distanceTo(meshPos)

          if (distToMesh < 0.15) {
            pinchingRef.current = { hand, prevPos: _pinchPoint.clone() }
            optionsRef.current.onPinchStart?.(hand, _pinchPoint.clone())
          }
        } else if (pinchingRef.current.hand === hand) {
          // Pinch move
          _moveDelta.subVectors(_pinchPoint, pinchingRef.current.prevPos)
          pinchingRef.current.prevPos.copy(_pinchPoint)
          optionsRef.current.onPinchMove?.(hand, _pinchPoint.clone(), _moveDelta.clone())
        }
      } else if (pinchingRef.current?.hand === hand) {
        // Pinch end
        optionsRef.current.onPinchEnd?.(hand)
        pinchingRef.current = null
      }
    }
  })
}
