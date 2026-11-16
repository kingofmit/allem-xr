'use client'

import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useXRFrame, useXRContext } from '@allem-xr/core'
import type { GestureName, GestureState, GestureOptions, XRHandJointName } from '../types'

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

// Cached position outputs for gesture detectors — avoids allocations in frame loop
const _pinchPos = new Vector3()
const _grabPos = new Vector3()
const _pointPos = new Vector3()
const _fistPos = new Vector3()
const _openPalmPos = new Vector3()

function getJointPosition(
  frame: XRFrame,
  hand: XRHand,
  jointName: XRHandJointName,
  referenceSpace: XRReferenceSpace,
  out: Vector3
): boolean {
  const space = hand.get(jointName as XRHandJoint)
  if (!space) return false
  const pose = frame.getJointPose?.(space, referenceSpace)
  if (!pose) return false
  out.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z)
  return true
}

/** Measure how curled a finger is (0 = straight, 1 = fully curled) */
function fingerCurl(
  frame: XRFrame,
  hand: XRHand,
  finger: string,
  referenceSpace: XRReferenceSpace
): number {
  const tip = `${finger}-tip` as XRHandJointName
  const proximal = `${finger}-phalanx-proximal` as XRHandJointName
  const metacarpal = `${finger}-metacarpal` as XRHandJointName

  if (
    !getJointPosition(frame, hand, tip, referenceSpace, _v1) ||
    !getJointPosition(frame, hand, proximal, referenceSpace, _v2) ||
    !getJointPosition(frame, hand, metacarpal, referenceSpace, _v3)
  ) {
    return 0
  }

  // Compare tip-metacarpal distance to proximal-metacarpal distance
  // When curled, tip is close to metacarpal
  const fullLength = _v2.distanceTo(_v3) * 2.5 // approximate full extension
  const tipDist = _v1.distanceTo(_v3)
  return Math.max(0, Math.min(1, 1 - tipDist / fullLength))
}

function detectPinch(
  frame: XRFrame,
  hand: XRHand,
  referenceSpace: XRReferenceSpace,
  threshold: number
): GestureState {
  const hasThumb = getJointPosition(frame, hand, 'thumb-tip', referenceSpace, _v1)
  const hasIndex = getJointPosition(frame, hand, 'index-finger-tip', referenceSpace, _v2)

  if (!hasThumb || !hasIndex) {
    return { active: false, confidence: 0, position: null, value: 0 }
  }

  const distance = _v1.distanceTo(_v2)
  const active = distance < threshold
  _pinchPos.addVectors(_v1, _v2).multiplyScalar(0.5)

  return {
    active,
    confidence: active ? Math.max(0, 1 - distance / threshold) : 0,
    position: _pinchPos,
    value: distance,
  }
}

function detectGrab(
  frame: XRFrame,
  hand: XRHand,
  referenceSpace: XRReferenceSpace,
  threshold: number
): GestureState {
  const fingers = ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']
  let totalCurl = 0
  let count = 0

  for (const finger of fingers) {
    const curl = fingerCurl(frame, hand, finger, referenceSpace)
    totalCurl += curl
    count++
  }

  const avgCurl = count > 0 ? totalCurl / count : 0
  const active = avgCurl > threshold

  // Grab position is the wrist
  let position: Vector3 | null = null
  if (getJointPosition(frame, hand, 'wrist', referenceSpace, _v1)) {
    _grabPos.copy(_v1)
    position = _grabPos
  }

  return {
    active,
    confidence: active ? avgCurl : 0,
    position,
    value: avgCurl,
  }
}

function detectPoint(
  frame: XRFrame,
  hand: XRHand,
  referenceSpace: XRReferenceSpace,
  threshold: number
): GestureState {
  // Index extended (low curl), others curled (high curl)
  const indexCurl = fingerCurl(frame, hand, 'index-finger', referenceSpace)
  const middleCurl = fingerCurl(frame, hand, 'middle-finger', referenceSpace)
  const ringCurl = fingerCurl(frame, hand, 'ring-finger', referenceSpace)
  const pinkyCurl = fingerCurl(frame, hand, 'pinky-finger', referenceSpace)

  const indexExtended = indexCurl < 0.3
  const othersCurled = (middleCurl + ringCurl + pinkyCurl) / 3 > threshold

  const active = indexExtended && othersCurled
  const confidence = active ? (1 - indexCurl) * ((middleCurl + ringCurl + pinkyCurl) / 3) : 0

  let position: Vector3 | null = null
  if (getJointPosition(frame, hand, 'index-finger-tip', referenceSpace, _v1)) {
    _pointPos.copy(_v1)
    position = _pointPos
  }

  return { active, confidence, position, value: confidence }
}

function detectFist(
  frame: XRFrame,
  hand: XRHand,
  referenceSpace: XRReferenceSpace,
  threshold: number
): GestureState {
  const fingers = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']
  let totalCurl = 0

  // For thumb, use different detection (thumb curl toward palm)
  const thumbCurl = fingerCurl(frame, hand, 'thumb', referenceSpace)
  totalCurl += thumbCurl

  for (const finger of fingers.slice(1)) {
    totalCurl += fingerCurl(frame, hand, finger, referenceSpace)
  }

  const avgCurl = totalCurl / fingers.length
  const active = avgCurl > threshold

  let position: Vector3 | null = null
  if (getJointPosition(frame, hand, 'wrist', referenceSpace, _v1)) {
    _fistPos.copy(_v1)
    position = _fistPos
  }

  return { active, confidence: active ? avgCurl : 0, position, value: avgCurl }
}

function detectOpenPalm(
  frame: XRFrame,
  hand: XRHand,
  referenceSpace: XRReferenceSpace,
  threshold: number
): GestureState {
  const fingers = ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']
  let totalCurl = 0

  for (const finger of fingers) {
    totalCurl += fingerCurl(frame, hand, finger, referenceSpace)
  }

  const avgCurl = totalCurl / fingers.length
  // Open palm = all fingers NOT curled
  const active = avgCurl < (1 - threshold)
  const confidence = active ? 1 - avgCurl : 0

  let position: Vector3 | null = null
  if (getJointPosition(frame, hand, 'wrist', referenceSpace, _v1)) {
    _openPalmPos.copy(_v1)
    position = _openPalmPos
  }

  return { active, confidence, position, value: 1 - avgCurl }
}

const DETECTORS: Record<
  GestureName,
  (f: XRFrame, h: XRHand, rs: XRReferenceSpace, t: number) => GestureState
> = {
  pinch: detectPinch,
  grab: detectGrab,
  point: detectPoint,
  fist: detectFist,
  'open-palm': detectOpenPalm,
}

const DEFAULT_THRESHOLDS: Record<GestureName, number> = {
  pinch: 0.025,   // 2.5cm between thumb and index
  grab: 0.7,      // 70% average finger curl
  point: 0.6,     // 60% curl for non-index fingers
  fist: 0.75,     // 75% average curl for all fingers
  'open-palm': 0.7, // 70% confidence threshold
}

/**
 * Detect a specific gesture on a hand.
 * Updates React state only when gesture active/inactive changes.
 */
export function useGesture(
  gesture: GestureName,
  options?: GestureOptions
): GestureState {
  const ctx = useXRContext()
  const hand = options?.hand ?? 'right'
  const threshold = options?.threshold ?? DEFAULT_THRESHOLDS[gesture]

  const [state, setState] = useState<GestureState>({
    active: false,
    confidence: 0,
    position: null,
    value: 0,
  })

  const prevActiveRef = useRef(false)
  const currentStateRef = useRef<GestureState>(state)

  const detector = DETECTORS[gesture]

  useXRFrame((frame, _delta, referenceSpace) => {
    const xrState = ctx.getFrameState()

    // Find the XRHand for the requested handedness
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
        const newState = { active: false, confidence: 0, position: null, value: 0 }
        currentStateRef.current = newState
        setState(newState)
      }
      return
    }

    const result = detector(frame, xrHand, referenceSpace, threshold)
    currentStateRef.current = result

    // Only trigger React re-render when active state changes
    if (result.active !== prevActiveRef.current) {
      prevActiveRef.current = result.active
      setState(result)
    }
  })

  return currentStateRef.current
}
