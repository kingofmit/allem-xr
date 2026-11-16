import type { Vector3 as ThreeVector3, Quaternion as ThreeQuaternion } from 'three'

/** All 25 XR hand joint names */
export type XRHandJointName =
  | 'wrist'
  | 'thumb-metacarpal' | 'thumb-phalanx-proximal' | 'thumb-phalanx-distal' | 'thumb-tip'
  | 'index-finger-metacarpal' | 'index-finger-phalanx-proximal' | 'index-finger-phalanx-intermediate' | 'index-finger-phalanx-distal' | 'index-finger-tip'
  | 'middle-finger-metacarpal' | 'middle-finger-phalanx-proximal' | 'middle-finger-phalanx-intermediate' | 'middle-finger-phalanx-distal' | 'middle-finger-tip'
  | 'ring-finger-metacarpal' | 'ring-finger-phalanx-proximal' | 'ring-finger-phalanx-intermediate' | 'ring-finger-phalanx-distal' | 'ring-finger-tip'
  | 'pinky-finger-metacarpal' | 'pinky-finger-phalanx-proximal' | 'pinky-finger-phalanx-intermediate' | 'pinky-finger-phalanx-distal' | 'pinky-finger-tip'

export interface JointState {
  position: ThreeVector3
  rotation: ThreeQuaternion
  radius: number
}

export interface HandState {
  /** Whether this hand is currently tracked/visible */
  visible: boolean
  /** Joint data -- updated every frame */
  joints: Map<XRHandJointName, JointState>
  /** Raw XRHand object */
  raw: XRHand | null
}

export interface HandsState {
  left: HandState | null
  right: HandState | null
}

export type GestureName = 'pinch' | 'grab' | 'point' | 'fist' | 'open-palm'

export interface GestureState {
  /** Whether the gesture is currently active */
  active: boolean
  /** Confidence 0-1 */
  confidence: number
  /** For pinch: the pinch point position. For point: the pointing direction origin. */
  position: ThreeVector3 | null
  /** For pinch: distance between fingers. For grab: grip strength 0-1. */
  value: number
}

export interface GestureOptions {
  hand?: 'left' | 'right'
  /** Activation threshold (meaning depends on gesture type) */
  threshold?: number
}

export interface HandModelProps {
  hand: 'left' | 'right'
  /** Visual style */
  model?: 'skeleton' | 'abstract' | 'spheres'
  color?: string
  opacity?: number
  jointSize?: number
  boneWidth?: number
}

export interface PinchInteractionOptions {
  onPinchStart?: (hand: 'left' | 'right', position: ThreeVector3) => void
  onPinchMove?: (hand: 'left' | 'right', position: ThreeVector3, delta: ThreeVector3) => void
  onPinchEnd?: (hand: 'left' | 'right') => void
}

export interface GrabInteractionOptions {
  onGrab?: (hand: 'left' | 'right', position: ThreeVector3) => void
  onMove?: (hand: 'left' | 'right', position: ThreeVector3, velocity: ThreeVector3) => void
  onRelease?: (hand: 'left' | 'right', velocity: ThreeVector3) => void
  threshold?: number
  grabDistance?: number
}

export interface HandRayProps {
  hand: 'left' | 'right'
  color?: string
  maxLength?: number
  opacity?: number
  visible?: boolean
}
