// Components
export { XRProvider } from './XRProvider'
export type { XRProviderProps } from './XRProvider'
export { XRScene } from './XRScene'
export type { XRSceneProps } from './XRScene'
export { XROrigin } from './XROrigin'
export type { XROriginProps } from './XROrigin'

// Hooks
export { useXR } from './hooks/useXR'
export { useXRSession } from './hooks/useXRSession'
export { useXREvent } from './hooks/useXREvent'
export { useXRSupport } from './hooks/useXRSupport'
export { useXRInput } from './hooks/useXRInput'
export { useXRFrame } from './hooks/useXRFrame'

// Context (for advanced use / other packages)
export { XRContext, useXRContext } from './context'

// Types
export type {
  XRMode,
  XRSessionState,
  XRInputType,
  XRHandedness,
  XRFeatureDescriptor,
  XRProviderConfig,
  XRInputAbstraction,
  XRState,
  XRActions,
  XRContextValue,
  XRSupport,
  XREventOptions,
  XRContextInternal,
} from './types'

// Errors (for other packages)
export { featureError, providerError } from './errors'
