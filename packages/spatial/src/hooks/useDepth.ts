'use client'

import { useRef, useState, useCallback } from 'react'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { DepthState, DepthOptions } from '../types'

/**
 * Access depth sensing data.
 * Requires 'depth-sensing' feature in XRProvider with appropriate usage/format.
 */
export function useDepth(options?: DepthOptions): DepthState {
  const ctx = useXRContext()
  const depthInfoRef = useRef<XRCPUDepthInformation | null>(null)
  const [supported, setSupported] = useState(false)

  useXRFrame((frame, _delta, _referenceSpace) => {
    const xrState = ctx.getFrameState()
    if (!xrState.viewerPose || !xrState.viewerPose.views[0]) {
      depthInfoRef.current = null
      return
    }

    try {
      const view = xrState.viewerPose.views[0]
      const depthInfo = (frame as any).getDepthInformation?.(view) as XRCPUDepthInformation | undefined
      if (depthInfo) {
        depthInfoRef.current = depthInfo
        if (!supported) setSupported(true)
      }
    } catch {
      depthInfoRef.current = null
    }
  })

  const getDepthAt = useCallback((x: number, y: number): number | null => {
    const info = depthInfoRef.current
    if (!info) return null
    try {
      return info.getDepthInMeters(x, y)
    } catch {
      return null
    }
  }, [])

  return {
    supported,
    getDepthAt,
    depthInfo: depthInfoRef.current,
  }
}
