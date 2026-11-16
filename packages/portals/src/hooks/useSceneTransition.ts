'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { TransitionConfig, SceneTransitionState } from '../types'

/**
 * Programmatic scene transition control.
 */
export function useSceneTransition(): SceneTransitionState {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const transition = useCallback(async (config?: TransitionConfig) => {
    const duration = config?.duration ?? 500

    setIsTransitioning(true)

    return new Promise<void>(resolve => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
        timeoutRef.current = null
        resolve()
      }, duration)
    })
  }, [])

  return { transition, isTransitioning }
}
