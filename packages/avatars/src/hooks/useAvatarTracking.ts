'use client'

import { Vector3, Quaternion } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { AvatarState } from '../types'

// Cached vectors — no frame-loop allocations
const _headPos = new Vector3()
const _headRot = new Quaternion()
const _leftHandPos = new Vector3()
const _leftHandRot = new Quaternion()
const _rightHandPos = new Vector3()
const _rightHandRot = new Quaternion()
const _hipPos = new Vector3()

interface AvatarTrackingOptions {
  head?: boolean
  hands?: boolean
  estimateBody?: boolean
}

/**
 * Automatically drives avatar IK targets from XR tracking data.
 */
export function useAvatarTracking(
  avatar: AvatarState,
  options?: AvatarTrackingOptions
) {
  const ctx = useXRContext()
  const { head = true, hands = true, estimateBody = true } = options ?? {}

  useXRFrame((frame, _delta, referenceSpace) => {
    if (!avatar.isLoaded) return
    const xrState = ctx.getFrameState()

    // Head tracking from viewer pose
    if (head && xrState.viewerPose) {
      const pose = xrState.viewerPose
      _headPos.set(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      )
      _headRot.set(
        pose.transform.orientation.x,
        pose.transform.orientation.y,
        pose.transform.orientation.z,
        pose.transform.orientation.w
      )
      avatar.setIKTarget('head', _headPos, _headRot)
    }

    // Hand tracking
    if (hands) {
      for (const input of xrState.inputSources) {
        if (!input.hand) continue

        const wristSpace = input.hand.get('wrist' as XRHandJoint)
        if (!wristSpace) continue

        const wristPose = frame.getJointPose?.(wristSpace, referenceSpace)
        if (!wristPose) continue

        if (input.handedness === 'left') {
          _leftHandPos.set(
            wristPose.transform.position.x,
            wristPose.transform.position.y,
            wristPose.transform.position.z
          )
          _leftHandRot.set(
            wristPose.transform.orientation.x,
            wristPose.transform.orientation.y,
            wristPose.transform.orientation.z,
            wristPose.transform.orientation.w
          )
          avatar.setIKTarget('leftHand', _leftHandPos, _leftHandRot)
        } else if (input.handedness === 'right') {
          _rightHandPos.set(
            wristPose.transform.position.x,
            wristPose.transform.position.y,
            wristPose.transform.position.z
          )
          _rightHandRot.set(
            wristPose.transform.orientation.x,
            wristPose.transform.orientation.y,
            wristPose.transform.orientation.z,
            wristPose.transform.orientation.w
          )
          avatar.setIKTarget('rightHand', _rightHandPos, _rightHandRot)
        }
      }
    }

    // Body estimation: infer hip position from head
    if (estimateBody && xrState.viewerPose) {
      // Hip is roughly 0.6m below and slightly behind head
      _hipPos.set(
        _headPos.x,
        _headPos.y - 0.6,
        _headPos.z + 0.05
      )
      avatar.setIKTarget('hips', _hipPos)
    }
  })
}
