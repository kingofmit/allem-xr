'use client'

import { useRef, useState, useCallback } from 'react'
import type { TransitionConfig, SceneTransitionState } from '../types'

/**
 * Programmatic scene transition control.
 */
export function useSceneTransition(): SceneTransitionState {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const resolveRef = useRef<(() => void) | null>(null)

  const transition = useCallback(async (config?: TransitionConfig) => {
    const duration = config?.duration ?? 500

    setIsTransitioning(true)

    return new Promise<void>(resolve => {
      resolveRef.current = resolve
      setTimeout(() => {
        setIsTransitioning(false)
        resolveRef.current = null
        resolve()
      }, duration)
    })
  }, [])

  return { transition, isTransitioning }
}
