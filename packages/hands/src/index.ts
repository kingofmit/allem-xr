// Hooks
export { useHands, JOINT_NAMES } from './hooks/useHands'
export { useGesture } from './hooks/useGesture'

// Components
export { HandModel } from './components/HandModel'

// Types
export type {
  XRHandJointName,
  JointState,
  HandState,
  HandsState,
  GestureName,
  GestureState,
  GestureOptions,
  HandModelProps,
} from './types'

// New hooks
export { useCustomGesture } from './hooks/useCustomGesture'
export type { CustomGestureConfig, CustomGestureResult } from './hooks/useCustomGesture'
export { usePinchInteraction } from './hooks/usePinchInteraction'
export { useGrabInteraction } from './hooks/useGrabInteraction'

// New components
export { HandRay } from './components/HandRay'

// New types
export type {
  PinchInteractionOptions,
  GrabInteractionOptions,
  HandRayProps,
} from './types'
