'use client'

import React, { useEffect, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRContext } from './context'
import type { XRContextInternal } from './types'

interface XRSceneProps {
  children?: ReactNode
}

/**
 * XRScene — place inside <Canvas> to enable XR rendering.
 * Bridges the XR session to the Three.js renderer and updates per-frame state.
 */
export function XRScene({ children }: XRSceneProps) {
  const gl = useThree(s => s.gl)
  const ctx = useXRContext()
  const internal = ctx as unknown as XRContextInternal

  // Register the GL renderer with XRProvider
  useEffect(() => {
    if (internal._glRef) {
      internal._glRef.current = gl
    }
    return () => {
      if (internal._glRef) {
        internal._glRef.current = null
      }
    }
  }, [gl, internal])

  // Per-frame XR state update — runs in the render loop, NOT React
  useFrame((_rootState, _delta, xrFrame) => {
    const frameState = internal._frameStateRef?.current
    if (!frameState) return

    if (xrFrame && frameState.referenceSpace) {
      // Update viewer pose
      const pose = xrFrame.getViewerPose(frameState.referenceSpace)
      frameState.viewerPose = pose ?? null
      frameState.frame = xrFrame

      // Update input selecting/squeezing state for all input types
      for (const input of frameState.inputSources) {
        const src = input.raw

        if (src.gamepad && src.gamepad.buttons.length > 0) {
          // Controller: read gamepad buttons
          input.selecting = src.gamepad.buttons[0]?.pressed ?? false
          input.squeezing = src.gamepad.buttons.length > 1
            ? (src.gamepad.buttons[1]?.pressed ?? false)
            : false
        } else if (src.hand) {
          // Hand: detect pinch (thumb-tip to index-tip proximity)
          const thumbTip = src.hand.get('thumb-tip' as XRHandJoint)
          const indexTip = src.hand.get('index-finger-tip' as XRHandJoint)
          if (thumbTip && indexTip) {
            const thumbPose = xrFrame.getJointPose?.(thumbTip, frameState.referenceSpace)
            const indexPose = xrFrame.getJointPose?.(indexTip, frameState.referenceSpace)
            if (thumbPose && indexPose) {
              const dx = thumbPose.transform.position.x - indexPose.transform.position.x
              const dy = thumbPose.transform.position.y - indexPose.transform.position.y
              const dz = thumbPose.transform.position.z - indexPose.transform.position.z
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
              input.selecting = distance < 0.025 // 2.5cm pinch threshold
            }
          }
          // Grab: not tracked at core level (handled by @allem-xr/hands)
          input.squeezing = false
        } else if (src.targetRayMode === 'gaze') {
          // Gaze: selecting state comes from session select events, not polled
          // Keep existing state — updated by XR select events
        }
      }
    } else {
      frameState.viewerPose = null
      frameState.frame = null
    }
  })

  return <>{children}</>
}

export type { XRSceneProps }
