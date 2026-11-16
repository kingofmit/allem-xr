'use client'

import { useRef, useState, useCallback } from 'react'
import { Vector3, Quaternion } from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { Anchor, AnchorState } from '../types'

const PERSIST_KEY = 'allem-xr-anchors'

/**
 * Create and manage spatial anchors.
 * Requires 'anchors' feature in XRProvider.
 * Supports persistent anchors on Quest via IndexedDB.
 */
export function useAnchor(): AnchorState {
  const ctx = useXRContext()
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const anchorsMapRef = useRef<Map<string, { anchor: Anchor; xrAnchor: XRAnchor }>>(new Map())
  const [supported, setSupported] = useState(false)

  // Update anchor poses each frame
  useXRFrame((_frame, _delta, referenceSpace) => {
    let anyChanged = false
    for (const [id, entry] of anchorsMapRef.current) {
      const pose = _frame.getPose(entry.xrAnchor.anchorSpace, referenceSpace)
      if (pose) {
        const a = entry.anchor
        const px = pose.transform.position.x
        const py = pose.transform.position.y
        const pz = pose.transform.position.z
        if (a.position.x !== px || a.position.y !== py || a.position.z !== pz) {
          a.position.set(px, py, pz)
          a.rotation.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          )
          a.isTracking = true
          anyChanged = true
        }
      } else if (entry.anchor.isTracking) {
        entry.anchor.isTracking = false
        anyChanged = true
      }
    }
    // Only re-render if tracking state changed
    if (anyChanged) {
      setAnchors(Array.from(anchorsMapRef.current.values()).map(e => e.anchor))
    }
  })

  const create = useCallback(async (position: Vector3, rotation: Quaternion): Promise<Anchor | null> => {
    const frameState = ctx.getFrameState()
    const frame = frameState.frame
    const referenceSpace = frameState.referenceSpace
    if (!frame || !referenceSpace) return null

    try {
      const transform = new XRRigidTransform(
        { x: position.x, y: position.y, z: position.z, w: 1 },
        { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
      )

      const xrAnchor: XRAnchor = await (frame as any).createAnchor(transform, referenceSpace)
      if (!xrAnchor) return null

      setSupported(true)

      const id = `anchor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const anchor: Anchor = {
        id,
        position: position.clone(),
        rotation: rotation.clone(),
        isTracking: true,
        isPersistent: false,
        raw: xrAnchor,
      }

      anchorsMapRef.current.set(id, { anchor, xrAnchor })
      setAnchors(Array.from(anchorsMapRef.current.values()).map(e => e.anchor))
      return anchor
    } catch {
      return null
    }
  }, [ctx])

  const deleteAnchor = useCallback(async (id: string): Promise<void> => {
    const entry = anchorsMapRef.current.get(id)
    if (entry) {
      entry.xrAnchor.delete?.()
      anchorsMapRef.current.delete(id)
      setAnchors(Array.from(anchorsMapRef.current.values()).map(e => e.anchor))
    }
  }, [])

  const persist = useCallback(async (id: string): Promise<string | null> => {
    const entry = anchorsMapRef.current.get(id)
    if (!entry) return null

    try {
      const handle = await (entry.xrAnchor as any).requestPersistentHandle?.()
      if (handle) {
        entry.anchor.isPersistent = true
        // Store in localStorage for cross-session restoration
        const stored = JSON.parse(localStorage.getItem(PERSIST_KEY) ?? '{}')
        stored[id] = handle
        localStorage.setItem(PERSIST_KEY, JSON.stringify(stored))
        setAnchors(Array.from(anchorsMapRef.current.values()).map(e => e.anchor))
        return handle
      }
    } catch {}
    return null
  }, [])

  const restore = useCallback(async (): Promise<Anchor[]> => {
    const frameState = ctx.getFrameState()
    const session = frameState.session
    if (!session) return []

    try {
      const stored = JSON.parse(localStorage.getItem(PERSIST_KEY) ?? '{}')
      const restoredAnchors: Anchor[] = []

      for (const [id, handle] of Object.entries(stored)) {
        try {
          const xrAnchor = await (session as any).restorePersistentAnchor?.(handle)
          if (xrAnchor) {
            const anchor: Anchor = {
              id,
              position: new Vector3(),
              rotation: new Quaternion(),
              isTracking: false,
              isPersistent: true,
              raw: xrAnchor,
            }
            anchorsMapRef.current.set(id, { anchor, xrAnchor })
            restoredAnchors.push(anchor)
          }
        } catch {
          // Handle may be invalid — remove from storage
          delete stored[id]
        }
      }

      localStorage.setItem(PERSIST_KEY, JSON.stringify(stored))
      if (restoredAnchors.length > 0) {
        setAnchors(Array.from(anchorsMapRef.current.values()).map(e => e.anchor))
      }
      return restoredAnchors
    } catch {
      return []
    }
  }, [ctx])

  return {
    supported,
    anchors,
    create,
    delete: deleteAnchor,
    persist,
    restore,
  }
}
