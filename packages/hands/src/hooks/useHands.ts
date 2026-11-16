'use client'

import { useRef, useState } from 'react'
import { Vector3, Quaternion } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { HandsState, HandState, JointState, XRHandJointName } from '../types'

const JOINT_NAMES: XRHandJointName[] = [
  'wrist',
  'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
  'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
  'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
  'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
  'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip',
]

function createEmptyHandState(): HandState {
  const joints = new Map<XRHandJointName, JointState>()
  for (const name of JOINT_NAMES) {
    joints.set(name, {
      position: new Vector3(),
      rotation: new Quaternion(),
      radius: 0,
    })
  }
  return { visible: false, joints, raw: null }
}

/**
 * Track both hands with 25 joints each.
 * Joint positions update every frame (read in useFrame for rendering).
 * React re-renders only when hand visibility changes.
 */
export function useHands(): HandsState {
  const ctx = useXRContext()

  // Mutable hand data -- updated every frame without re-renders
  const leftRef = useRef<HandState>(createEmptyHandState())
  const rightRef = useRef<HandState>(createEmptyHandState())

  // Reactive state -- only updates on visibility changes
  const [hands, setHands] = useState<HandsState>({ left: null, right: null })
  const prevVisibleRef = useRef({ left: false, right: false })

  useXRFrame((frame, _delta, referenceSpace) => {
    const state = ctx.getFrameState()
    let leftVisible = false
    let rightVisible = false

    for (const input of state.inputSources) {
      if (!input.hand) continue

      const handRef = input.handedness === 'left' ? leftRef : rightRef
      if (input.handedness !== 'left' && input.handedness !== 'right') continue

      const handData = handRef.current
      handData.raw = input.hand

      let anyTracked = false
      for (const jointName of JOINT_NAMES) {
        const jointSpace = input.hand.get(jointName as XRHandJoint)
        if (!jointSpace) continue

        const pose = frame.getJointPose?.(jointSpace, referenceSpace)
        if (pose) {
          anyTracked = true
          const joint = handData.joints.get(jointName)!
          joint.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          )
          joint.rotation.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          )
          joint.radius = pose.radius ?? 0.005
        }
      }

      handData.visible = anyTracked
      if (input.handedness === 'left') leftVisible = anyTracked
      else rightVisible = anyTracked
    }

    // Only trigger React re-render when visibility changes
    if (
      leftVisible !== prevVisibleRef.current.left ||
      rightVisible !== prevVisibleRef.current.right
    ) {
      prevVisibleRef.current = { left: leftVisible, right: rightVisible }
      setHands({
        left: leftVisible ? leftRef.current : null,
        right: rightVisible ? rightRef.current : null,
      })
    }
  })

  // Always return current ref data for frame-level consumers
  return {
    left: leftRef.current.visible ? leftRef.current : hands.left,
    right: rightRef.current.visible ? rightRef.current : hands.right,
  }
}

export { JOINT_NAMES }
