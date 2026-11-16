'use client'

import { useRef, useState } from 'react'
import { Vector3, Quaternion } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { HitTestState, HitTestOptions, HitTestResult } from '../types'

// Cached objects to avoid frame-loop allocations
const _pos = new Vector3()
const _rot = new Quaternion()

/**
 * Perform hit testing against real-world geometry.
 * Requires 'hit-test' feature in XRProvider.
 */
export function useHitTest(options?: HitTestOptions): HitTestState {
  const ctx = useXRContext()
  const source = options?.source ?? 'viewer'

  const hitTestSourceRef = useRef<XRHitTestSource | null>(null)
  const requestPendingRef = useRef(false)
  const [state, setState] = useState<HitTestState>({
    supported: false,
    results: [],
  })
  const resultsRef = useRef<HitTestResult[]>([])

  useXRFrame((frame, _delta, referenceSpace) => {
    const xrState = ctx.getFrameState()
    const session = xrState.session
    if (!session) return

    // Request hit test source once
    if (!hitTestSourceRef.current && !requestPendingRef.current) {
      requestPendingRef.current = true

      // Determine the space for hit testing
      let space: XRSpace = referenceSpace
      if (source === 'viewer') {
        // Use viewer space for head-based hit testing
        session.requestReferenceSpace('viewer').then(viewerSpace => {
          const offsetRay = options?.offsetRay
            ? new XRRay(
                new DOMPoint(
                  options.offsetRay.origin.x ?? 0,
                  options.offsetRay.origin.y ?? 0,
                  options.offsetRay.origin.z ?? 0,
                  options.offsetRay.origin.w ?? 1
                ),
                new DOMPoint(
                  options.offsetRay.direction.x ?? 0,
                  options.offsetRay.direction.y ?? -1,
                  options.offsetRay.direction.z ?? 0,
                  options.offsetRay.direction.w ?? 0
                )
              )
            : undefined

          session.requestHitTestSource?.({
            space: viewerSpace,
            offsetRay,
          })?.then(src => {
            hitTestSourceRef.current = src
            setState(prev => ({ ...prev, supported: true }))
          }).catch(() => {
            requestPendingRef.current = false
            setState(prev => ({ ...prev, supported: false }))
          })
        }).catch(() => {
          requestPendingRef.current = false
        })
      } else {
        // Use input source space (controller/hand)
        const handedness = source.includes('left') ? 'left' : 'right'
        const inputSource = xrState.inputSources.find(
          s => s.handedness === handedness
        )
        if (inputSource) {
          session.requestHitTestSource?.({
            space: inputSource.targetRaySpace,
          })?.then(src => {
            hitTestSourceRef.current = src
            setState(prev => ({ ...prev, supported: true }))
          }).catch(() => {
            requestPendingRef.current = false
          })
        } else {
          requestPendingRef.current = false
        }
      }
    }

    // Read hit test results
    const hitTestSource = hitTestSourceRef.current
    if (!hitTestSource) return

    const rawResults = frame.getHitTestResults(hitTestSource)
    const newResults: HitTestResult[] = []

    for (const result of rawResults) {
      const pose = result.getPose(referenceSpace)
      if (pose) {
        newResults.push({
          position: new Vector3(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          ),
          rotation: new Quaternion(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          ),
        })
      }
    }

    // Only update React state when result count changes
    if (newResults.length !== resultsRef.current.length) {
      resultsRef.current = newResults
      setState({ supported: true, results: newResults })
    } else {
      // Update positions in place for frame-level consumers
      resultsRef.current = newResults
    }
  })

  return { ...state, results: resultsRef.current }
}
