'use client'

import { useXRContext } from '../context'
import type { XRState, XRActions } from '../types'

/**
 * Access XR session state and actions.
 * Returns reactive state — safe to use in render.
 * For per-frame data, use useXRFrame instead.
 */
export function useXR(): XRState & XRActions {
  const ctx = useXRContext()
  return {
    ...ctx.state,
    start: ctx.start,
    end: ctx.end,
  }
}
