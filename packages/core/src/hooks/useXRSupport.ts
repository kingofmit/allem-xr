'use client'

import { useEffect, useState } from 'react'
import type { XRSupport } from '../types'

/**
 * Detect WebXR support and feature availability.
 * Can be used outside XRProvider.
 */
export function useXRSupport(): XRSupport {
  const [support, setSupport] = useState<XRSupport>({
    isWebXRAvailable: false,
    vr: false,
    ar: false,
    inline: false,
    isLoading: true,
    featureSupport: new Map(),
  })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      setSupport(prev => ({ ...prev, isLoading: false }))
      return
    }

    let cancelled = false

    async function detect() {
      const xr = navigator.xr!
      const [vr, ar, inline] = await Promise.all([
        xr.isSessionSupported('immersive-vr').catch(() => false),
        xr.isSessionSupported('immersive-ar').catch(() => false),
        xr.isSessionSupported('inline').catch(() => false),
      ])

      if (cancelled) return

      setSupport({
        isWebXRAvailable: true,
        vr,
        ar,
        inline,
        isLoading: false,
        featureSupport: new Map(),
      })
    }

    detect()
    return () => { cancelled = true }
  }, [])

  return support
}
