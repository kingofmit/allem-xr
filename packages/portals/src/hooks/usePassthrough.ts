'use client'

import { useCallback, useState } from 'react'
import { useXRContext } from '@allem-xr/core'

export interface PassthroughState {
  isAvailable: boolean
  isEnabled: boolean
  enable: () => void
  disable: () => void
}

/**
 * Control XR passthrough mode.
 * Availability depends on device and session type.
 */
export function usePassthrough(): PassthroughState {
  const ctx = useXRContext()
  const [isEnabled, setIsEnabled] = useState(false)

  const session = ctx.state.session
  const isAvailable = ctx.state.isAR || (session as any)?.environmentBlendMode === 'alpha-blend'

  const enable = useCallback(() => {
    setIsEnabled(true)
  }, [])

  const disable = useCallback(() => {
    setIsEnabled(false)
  }, [])

  return { isAvailable, isEnabled, enable, disable }
}
