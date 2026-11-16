import type React from 'react'

export type XRMode = 'inline' | 'immersive-vr' | 'immersive-ar'

export type XRSessionState = 'idle' | 'requesting' | 'active' | 'ending' | 'error'

export type XRInputType = 'controller' | 'hand' | 'gaze' | 'transient-pointer' | 'screen'

export type XRHandedness = 'left' | 'right' | 'none'

export interface XRFeatureDescriptor {
  name: string
  required: boolean
}

export interface XRProviderConfig {
  /** Preferred XR mode */
  mode?: XRMode
  /** Features to request (strings are treated as optional) */
  features?: (string | XRFeatureDescriptor)[]
  /** Reference space type */
  referenceSpace?: XRReferenceSpaceType
  /** Foveation level 0-1 (WebGPU/WebXR Layers) */
  foveation?: number
  /** Framebuffer scale factor */
  frameBufferScaling?: number
}

export interface XRInputAbstraction {
  /** Unique identifier for this input source */
  id: number
  /** Input type */
  type: XRInputType
  /** Left, right, or none */
  handedness: XRHandedness
  /** The raw XRInputSource */
  raw: XRInputSource
  /** Target ray space — where the input is pointing */
  targetRaySpace: XRSpace
  /** Grip space — where the input physically is */
  gripSpace: XRSpace | null
  /** Gamepad state (controllers only) */
  gamepad: Gamepad | null
  /** Hand tracking data (hands only) */
  hand: XRHand | null
  /** Whether the primary action is active (trigger/pinch/gaze-dwell) */
  selecting: boolean
  /** Whether the secondary action is active (grip/grab) */
  squeezing: boolean
}

export interface XRState {
  /** Current session or null */
  session: XRSession | null
  /** Session state machine */
  sessionState: XRSessionState
  /** Active XR mode */
  mode: XRMode
  /** Whether currently presenting */
  isPresenting: boolean
  /** Whether in AR mode */
  isAR: boolean
  /** Whether in VR mode */
  isVR: boolean
  /** Active reference space */
  referenceSpace: XRReferenceSpace | null
  /** Supported and active features */
  features: Set<string>
  /** Abstracted input sources */
  inputSources: XRInputAbstraction[]
  /** Current viewer pose (updated per-frame, read in useFrame) */
  viewerPose: XRViewerPose | null
  /** The current XRFrame (only valid during frame callback) */
  frame: XRFrame | null
  /** Error if session failed */
  error: Error | null
}

export interface XRActions {
  /** Start an XR session */
  start: (mode?: XRMode) => Promise<void>
  /** End the current XR session */
  end: () => Promise<void>
}

export interface XRContextValue extends XRActions {
  /** Reactive session-level state (safe to use in render) */
  state: XRState
  /** Subscribe to per-frame XR updates (call inside useFrame only) */
  getFrameState: () => XRState
  /** Provider config */
  config: XRProviderConfig
}

export interface XRSupport {
  /** Whether WebXR is available at all */
  isWebXRAvailable: boolean
  /** Whether immersive-vr is supported */
  vr: boolean
  /** Whether immersive-ar is supported */
  ar: boolean
  /** Whether inline sessions are supported */
  inline: boolean
  /** Loading state */
  isLoading: boolean
  /** Per-feature support check results */
  featureSupport: Map<string, boolean>
}

export interface XREventOptions {
  /** Filter by handedness */
  handedness?: XRHandedness
}

/** @internal — used by XRScene to access provider internals */
export interface XRContextInternal {
  _glRef: React.MutableRefObject<any>
  _frameStateRef: React.MutableRefObject<XRState>
  _sessionListenersRef: React.MutableRefObject<Array<{ event: string; handler: EventListener }>>
}
