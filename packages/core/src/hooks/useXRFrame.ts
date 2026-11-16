'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXRContext } from '../context'

/**
 * Register a callback that runs every XR frame.
 * Only fires when an XR session is active.
 * Use this for per-frame XR logic (reading poses, updating joints, etc.)
 */
export function useXRFrame(
  callback: (frame: XRFrame, delta: number, referenceSpace: XRReferenceSpace) => void
) {
  const ctx = useXRContext()
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useFrame((_state, delta, xrFrame) => {
    const frameState = ctx.getFrameState()
    if (xrFrame && frameState.referenceSpace) {
      try {
        callbackRef.current(xrFrame, delta, frameState.referenceSpace)
      } catch (e) {
        console.error('[allem-xr] useXRFrame callback error:', e)
      }
    }
  })
}
