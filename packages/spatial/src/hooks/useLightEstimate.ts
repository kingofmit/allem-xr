'use client'

import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { LightEstimateState } from '../types'

// Cached to avoid frame-loop allocations
const _dir = new Vector3()

/**
 * Access real-world light estimation.
 * Requires 'light-estimation' feature in XRProvider.
 */
export function useLightEstimate(): LightEstimateState {
  const ctx = useXRContext()
  const [state, setState] = useState<LightEstimateState>({
    supported: false,
    primaryDirection: new Vector3(0, -1, 0),
    primaryIntensity: 1,
    sphericalHarmonics: null,
  })

  const prevIntensityRef = useRef(1)
  // XRLightProbe and XRLightEstimate are experimental — no standard types
  const lightProbeRef = useRef<any>(null)
  const probeRequestedRef = useRef(false)

  useXRFrame((frame, _delta, _referenceSpace) => {
    const xrState = ctx.getFrameState()
    const session = xrState.session
    if (!session) return

    // Request light probe once
    if (!lightProbeRef.current && !probeRequestedRef.current) {
      probeRequestedRef.current = true
      ;(session as any).requestLightProbe?.()?.then((probe: any) => {
        lightProbeRef.current = probe
        setState(prev => ({ ...prev, supported: true }))
      }).catch(() => {
        probeRequestedRef.current = false
      })
    }

    const probe = lightProbeRef.current
    if (!probe) return

    const estimate = (frame as any).getLightEstimate?.(probe)
    if (!estimate) return

    const dir = estimate.primaryLightDirection
    const intensity = estimate.primaryLightIntensity

    // Only update React state when intensity changes meaningfully
    const intensityMag = Math.sqrt(intensity.x * intensity.x + intensity.y * intensity.y + intensity.z * intensity.z)
    if (Math.abs(intensityMag - prevIntensityRef.current) > 0.05) {
      prevIntensityRef.current = intensityMag
      setState({
        supported: true,
        primaryDirection: new Vector3(dir.x, dir.y, dir.z),
        primaryIntensity: intensityMag,
        sphericalHarmonics: estimate.sphericalHarmonicsCoefficients
          ? new Float32Array(estimate.sphericalHarmonicsCoefficients)
          : null,
      })
    }
  })

  return state
}
