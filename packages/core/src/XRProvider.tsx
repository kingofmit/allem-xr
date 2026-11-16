'use client'

import React, { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { XRContext, defaultState } from './context'
import type { XRContextValue, XRContextInternal, XRInputAbstraction, XRMode, XRProviderConfig, XRState } from './types'

interface XRProviderProps {
  children: ReactNode
  /** Preferred XR mode. Defaults to 'immersive-ar' */
  mode?: XRMode
  /** XR features to request. Strings are treated as optional features. */
  features?: (string | { name: string; required: boolean })[]
  /** Reference space type. Defaults to 'local-floor' */
  referenceSpace?: XRReferenceSpaceType
  /** Foveation level 0-1 */
  foveation?: number
  /** Framebuffer scale factor */
  frameBufferScaling?: number
  /** Fallback UI when WebXR is not available */
  fallback?: ReactNode
  /** Called when session starts */
  onSessionStart?: (session: XRSession) => void
  /** Called when session ends */
  onSessionEnd?: () => void
  /** Called on error */
  onError?: (error: Error) => void
}

function resolveFeatures(features: XRProviderProps['features']): {
  required: string[]
  optional: string[]
} {
  const required: string[] = []
  const optional: string[] = []
  for (const f of features ?? []) {
    if (typeof f === 'string') {
      optional.push(f)
    } else if (f.required) {
      required.push(f.name)
    } else {
      optional.push(f.name)
    }
  }
  return { required, optional }
}

export function XRProvider({
  children,
  mode = 'immersive-ar',
  features,
  referenceSpace = 'local-floor',
  foveation,
  frameBufferScaling,
  fallback,
  onSessionStart,
  onSessionEnd,
  onError,
}: XRProviderProps) {
  const config = useMemo<XRProviderConfig>(
    () => ({ mode, features, referenceSpace, foveation, frameBufferScaling }),
    [mode, features, referenceSpace, foveation, frameBufferScaling]
  )

  // Reactive state — triggers re-renders for session-level changes
  const [reactiveState, setReactiveState] = useState<XRState>({ ...defaultState })

  // Mutable frame state — updated per frame, no re-renders
  const frameStateRef = useRef<XRState>({ ...defaultState })

  // GL renderer ref — set by XRScene when it mounts
  const glRef = useRef<any>(null)

  // Callbacks ref to avoid stale closures
  const callbacksRef = useRef({ onSessionStart, onSessionEnd, onError })
  callbacksRef.current = { onSessionStart, onSessionEnd, onError }

  // Track session listeners for proper cleanup
  const sessionListenersRef = useRef<Array<{ event: string; handler: EventListener }>>([])

  // Stable reference for features to avoid callback regeneration
  const featuresRef = useRef(features)
  featuresRef.current = features

  const updateState = useCallback((patch: Partial<XRState>) => {
    setReactiveState(prev => {
      const next = { ...prev, ...patch }
      // Also update frame state ref
      Object.assign(frameStateRef.current, patch)
      return next
    })
  }, [])

  const start = useCallback(async (overrideMode?: XRMode) => {
    // Guard against double-start
    if (frameStateRef.current.sessionState === 'active' || frameStateRef.current.sessionState === 'requesting') {
      return
    }

    const sessionMode = overrideMode ?? mode
    if (!navigator.xr) {
      const err = new Error(
        `allem-xr: WebXR is not available in this browser.\n\n` +
        `  Supported browsers:\n` +
        `  \u2022 Meta Quest Browser \u2713\n` +
        `  \u2022 Chrome (Android) \u2713\n` +
        `  \u2022 Safari (visionOS) \u2713 (VR only)\n` +
        `  \u2022 Edge \u2713\n`
      )
      updateState({ sessionState: 'error', error: err })
      callbacksRef.current.onError?.(err)
      return
    }

    updateState({ sessionState: 'requesting', error: null })

    try {
      const { required, optional } = resolveFeatures(featuresRef.current)
      const session = await navigator.xr!.requestSession(sessionMode, {
        requiredFeatures: required.length > 0 ? required : undefined,
        optionalFeatures: optional.length > 0 ? optional : undefined,
      })

      // Get reference space
      let refSpace: XRReferenceSpace
      try {
        refSpace = await session.requestReferenceSpace(referenceSpace)
      } catch {
        // Fallback to 'local' if requested type unavailable
        refSpace = await session.requestReferenceSpace('local')
      }

      // Bind to Three.js renderer if available
      const gl = glRef.current
      if (gl?.xr) {
        await gl.xr.setSession(session)
        if (foveation !== undefined && gl.xr.setFoveation) {
          gl.xr.setFoveation(foveation)
        }
        if (frameBufferScaling !== undefined && gl.xr.setFramebufferScaleFactor) {
          gl.xr.setFramebufferScaleFactor(frameBufferScaling)
        }
      }

      // Collect granted features
      const grantedFeatures = new Set<string>()
      // enabledFeatures is available on some implementations
      if ((session as any).enabledFeatures) {
        for (const f of (session as any).enabledFeatures) {
          grantedFeatures.add(f)
        }
      }

      // Build input source abstractions
      const inputSources = buildInputSources(session.inputSources)

      const newState: Partial<XRState> = {
        session,
        sessionState: 'active',
        mode: sessionMode,
        isPresenting: true,
        isAR: sessionMode === 'immersive-ar',
        isVR: sessionMode === 'immersive-vr',
        referenceSpace: refSpace,
        features: grantedFeatures,
        inputSources,
        error: null,
      }

      updateState(newState)
      callbacksRef.current.onSessionStart?.(session)

      // Clean up any old listeners
      for (const { event, handler } of sessionListenersRef.current) {
        try { session.removeEventListener(event, handler) } catch {}
      }
      sessionListenersRef.current = []

      // Listen for input source changes
      const handleInputSourcesChange = () => {
        const sources = buildInputSources(session.inputSources)
        updateState({ inputSources: sources })
      }

      // Listen for session end
      const handleSessionEnd = () => {
        // Remove all session listeners
        for (const { event: ev, handler: h } of sessionListenersRef.current) {
          try { session.removeEventListener(ev, h) } catch {}
        }
        sessionListenersRef.current = []

        const endState: Partial<XRState> = {
          session: null,
          sessionState: 'idle',
          isPresenting: false,
          isAR: false,
          isVR: false,
          referenceSpace: null,
          inputSources: [],
          viewerPose: null,
          frame: null,
        }
        updateState(endState)
        if (gl?.xr) {
          gl.xr.setSession(null)
        }
        callbacksRef.current.onSessionEnd?.()
      }

      session.addEventListener('inputsourceschange', handleInputSourcesChange)
      session.addEventListener('end', handleSessionEnd)
      sessionListenersRef.current = [
        { event: 'inputsourceschange', handler: handleInputSourcesChange },
        { event: 'end', handler: handleSessionEnd },
      ]
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      updateState({ sessionState: 'error', error: err })
      callbacksRef.current.onError?.(err)
    }
  }, [mode, referenceSpace, foveation, frameBufferScaling, updateState])

  const end = useCallback(async () => {
    const currentState = frameStateRef.current.sessionState
    if (currentState !== 'active') return

    const session = frameStateRef.current.session
    if (!session) return

    updateState({ sessionState: 'ending' })
    try {
      await session.end()
    } catch {
      // Session may already be ended
    }
  }, [updateState])

  const getFrameState = useCallback(() => frameStateRef.current, [])

  const contextValue = useMemo<XRContextValue>(
    () => ({
      state: reactiveState,
      getFrameState,
      config,
      start,
      end,
      // Expose internal refs for XRScene to register
      _glRef: glRef,
      _frameStateRef: frameStateRef,
      _sessionListenersRef: sessionListenersRef,
    } as XRContextValue & XRContextInternal),
    [reactiveState, getFrameState, config, start, end]
  )

  return <XRContext.Provider value={contextValue}>{children}</XRContext.Provider>
}

function buildInputSources(sources: XRInputSourceArray): XRInputAbstraction[] {
  const result: XRInputAbstraction[] = []
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i]
    let type: XRInputAbstraction['type']
    switch (src.targetRayMode) {
      case 'tracked-pointer':
        type = src.hand ? 'hand' : 'controller'
        break
      case 'gaze':
        type = 'gaze'
        break
      case 'screen':
        type = 'screen'
        break
      case 'transient-pointer':
        type = 'transient-pointer'
        break
      default:
        type = 'controller'
    }

    result.push({
      id: i,
      type,
      handedness: src.handedness as XRInputAbstraction['handedness'],
      raw: src,
      targetRaySpace: src.targetRaySpace,
      gripSpace: src.gripSpace ?? null,
      gamepad: src.gamepad ?? null,
      hand: src.hand ?? null,
      selecting: false,
      squeezing: false,
    })
  }
  return result
}

export type { XRProviderProps }
