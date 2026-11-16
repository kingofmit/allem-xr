'use client'

import { useEffect, useRef } from 'react'
import { useXRContext } from '../context'
import type { XREventOptions, XRHandedness } from '../types'

type XRSessionEventType =
  | 'select'
  | 'selectstart'
  | 'selectend'
  | 'squeeze'
  | 'squeezestart'
  | 'squeezeend'
  | 'inputsourceschange'
  | 'end'
  | 'visibilitychange'

/**
 * Listen to XR session events with optional handedness filter.
 */
export function useXREvent(
  event: XRSessionEventType,
  handler: (event: Event) => void,
  options?: XREventOptions
) {
  const ctx = useXRContext()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const session = ctx.state.session
    if (!session) return

    const listener = (e: Event) => {
      // Filter by handedness if specified
      if (optionsRef.current?.handedness && 'inputSource' in e) {
        const inputEvent = e as XRInputSourceEvent
        if (inputEvent.inputSource.handedness !== optionsRef.current.handedness) {
          return
        }
      }
      handlerRef.current(e)
    }

    session.addEventListener(event, listener)
    return () => {
      session.removeEventListener(event, listener)
    }
  }, [ctx.state.session, event])
}
