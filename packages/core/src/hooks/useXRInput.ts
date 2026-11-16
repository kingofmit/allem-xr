'use client'

import { useMemo } from 'react'
import { useXRContext } from '../context'
import type { XRInputAbstraction, XRInputType, XRHandedness } from '../types'

interface UseXRInputOptions {
  type?: XRInputType
  handedness?: XRHandedness
}

/**
 * Access abstracted XR input sources.
 * Optionally filter by type and/or handedness.
 */
export function useXRInput(options?: UseXRInputOptions): XRInputAbstraction[] {
  const ctx = useXRContext()
  const sources = ctx.state.inputSources
  const type = options?.type
  const handedness = options?.handedness

  return useMemo(() => {
    let filtered = sources
    if (type) {
      filtered = filtered.filter(s => s.type === type)
    }
    if (handedness) {
      filtered = filtered.filter(s => s.handedness === handedness)
    }
    return filtered
  }, [sources, type, handedness])
}
