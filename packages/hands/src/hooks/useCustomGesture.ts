'use client'

import { useRef, useState } from 'react'
import { useXRFrame, useXRContext } from '@allem-xr/core'
import type { XRHandJointName, JointState } from '../types'
import { Vector3, Quaternion } from 'three'
import { JOINT_NAMES } from './useHands'

export interface CustomGestureConfig {
  name: string
  detect: (joints: Map<XRHandJointName, JointState>) => {
    active: boolean
    confidence: number
    data?: any
  }
}

export interface CustomGestureResult {
  active: boolean
  confidence: number
  data: any
}

/**
 * Register and detect a custom gesture.
 * Provide a detect function that analyzes joint positions each frame.
 */
export function useCustomGesture(
  config: CustomGestureConfig,
  hand: 'left' | 'right' = 'right'
): CustomGestureResult {
  const ctx = useXRContext()
  const [state, setState] = useState<CustomGestureResult>({
    active: false,
    confidence: 0,
    data: null,
  })

  const prevActiveRef = useRef(false)
  const currentRef = useRef<CustomGestureResult>(state)
  const jointsRef = useRef<Map<XRHandJointName, JointState>>(new Map())

  // Initialize joints map once
  if (jointsRef.current.size === 0) {
    for (const name of JOINT_NAMES) {
      jointsRef.current.set(name, {
        position: new Vector3(),
        rotation: new Quaternion(),
        radius: 0,
      })
    }
  }

  useXRFrame((frame, _delta, referenceSpace) => {
    const xrState = ctx.getFrameState()

    // Find hand
    let xrHand: XRHand | null = null
    for (const input of xrState.inputSources) {
      if (input.handedness === hand && input.hand) {
        xrHand = input.hand
        break
      }
    }

    if (!xrHand) {
      if (prevActiveRef.current) {
        prevActiveRef.current = false
        const result = { active: false, confidence: 0, data: null }
        currentRef.current = result
        setState(result)
      }
      return
    }

    // Update joints map
    for (const jointName of JOINT_NAMES) {
      const jointSpace = xrHand.get(jointName as XRHandJoint)
      if (!jointSpace) continue

      const pose = frame.getJointPose?.(jointSpace, referenceSpace)
      if (!pose) continue

      const joint = jointsRef.current.get(jointName)!
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

    // Run custom detector
    const detection = config.detect(jointsRef.current)
    const result: CustomGestureResult = {
      active: detection.active,
      confidence: detection.confidence,
      data: detection.data ?? null,
    }
    currentRef.current = result

    // Only trigger React re-render on state change
    if (detection.active !== prevActiveRef.current) {
      prevActiveRef.current = detection.active
      setState(result)
    }
  })

  return currentRef.current
}
