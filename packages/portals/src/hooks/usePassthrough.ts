'use client'

import { useCallback, useState } from 'react'
import { useXRContext } from '@allem-xr/core'

export interface PassthroughState {
  /** Whether the device supports passthrough (AR mode or alpha-blend) */
  isAvailable: boolean
  /** Local enabled state — use with PassthroughWindow component */
  isEnabled: boolean
  /** Set enabled state */
  enable: () => void
  /** Set disabled state */
  disable: () => void
}

/**
 * Track passthrough availability and enabled state.
 * Note: Actual passthrough rendering depends on the XR compositor.
 * Use the PassthroughWindow component to create passthrough holes in VR.
 * For full passthrough, use immersive-ar mode in XRProvider.
 */
export function usePassthrough(): PassthroughState {
  const ctx = useXRContext()
  const [isEnabled, setIsEnabled] = useState(false)

  const session = ctx.state.session
  const isAvailable = ctx.state.isAR ||
    (session ? (session as any).environmentBlendMode === 'alpha-blend' : false)

  const enable = useCallback(() => setIsEnabled(true), [])
  const disable = useCallback(() => setIsEnabled(false), [])

  return { isAvailable, isEnabled, enable, disable }
}
