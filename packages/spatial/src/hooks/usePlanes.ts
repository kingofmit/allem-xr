'use client'

import { useRef, useState } from 'react'
import { Vector3, Quaternion } from 'three'

// Cached vector to avoid per-change allocations in label inference
const _up = new Vector3()
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { DetectedPlane, PlaneDetectionState, PlaneDetectionOptions, PlaneLabel } from '../types'

/**
 * Detect real-world planes (floors, walls, tables).
 * Requires 'plane-detection' feature in XRProvider.
 */
export function usePlanes(options?: PlaneDetectionOptions): PlaneDetectionState {
  const ctx = useXRContext()
  const filter = options?.filter ?? 'all'

  const [state, setState] = useState<PlaneDetectionState>({
    supported: false,
    planes: [],
    isDetecting: false,
  })

  const prevPlaneCountRef = useRef(0)
  const planesMapRef = useRef<Map<XRPlane, DetectedPlane>>(new Map())

  useXRFrame((frame, _delta, referenceSpace) => {
    const detectedPlanes = (frame as any).detectedPlanes as Set<XRPlane> | undefined
    if (!detectedPlanes) {
      if (state.supported) {
        setState({ supported: false, planes: [], isDetecting: false })
      }
      return
    }

    // Track which planes are still present
    const currentPlanes = new Map<XRPlane, DetectedPlane>()
    let changed = false

    for (const xrPlane of detectedPlanes) {
      const existing = planesMapRef.current.get(xrPlane)

      if (existing && xrPlane.lastChangedTime <= (existing as any)._lastChanged) {
        // Plane hasn't changed — keep existing data
        currentPlanes.set(xrPlane, existing)
        continue
      }

      // New or updated plane
      changed = true
      const pose = frame.getPose(xrPlane.planeSpace, referenceSpace)
      if (!pose) continue

      const position = new Vector3(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      )
      const rotation = new Quaternion(
        pose.transform.orientation.x,
        pose.transform.orientation.y,
        pose.transform.orientation.z,
        pose.transform.orientation.w
      )

      // Convert polygon boundary
      const polygon: Vector3[] = []
      if (xrPlane.polygon) {
        for (const point of xrPlane.polygon) {
          polygon.push(new Vector3(point.x, point.y, point.z))
        }
      }

      // Compute extent from polygon
      let minX = Infinity, maxX = -Infinity
      let minZ = Infinity, maxZ = -Infinity
      for (const p of polygon) {
        minX = Math.min(minX, p.x)
        maxX = Math.max(maxX, p.x)
        minZ = Math.min(minZ, p.z)
        maxZ = Math.max(maxZ, p.z)
      }
      const width = polygon.length > 0 ? maxX - minX : 0
      const height = polygon.length > 0 ? maxZ - minZ : 0

      // Determine label from orientation and semanticLabel
      let label: PlaneLabel = 'unknown'
      if ((xrPlane as any).semanticLabel) {
        label = (xrPlane as any).semanticLabel as PlaneLabel
      } else {
        // Infer from normal direction (plane's local Y axis in world space)
        _up.set(0, 1, 0).applyQuaternion(rotation)
        const up = _up
        if (Math.abs(up.y) > 0.8) {
          label = position.y < 0.3 ? 'floor' : position.y > 2.0 ? 'ceiling' : 'table'
        } else {
          label = 'wall'
        }
      }

      const id = existing?.id ?? `plane-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const plane: DetectedPlane = {
        id,
        position,
        rotation,
        polygon,
        label,
        extent: [width, height],
        raw: xrPlane,
      }
      ;(plane as any)._lastChanged = xrPlane.lastChangedTime

      currentPlanes.set(xrPlane, plane)
    }

    // Check if planes were removed
    if (currentPlanes.size !== planesMapRef.current.size) {
      changed = true
    }

    planesMapRef.current = currentPlanes

    if (changed || !state.supported) {
      let planes = Array.from(currentPlanes.values())

      // Apply filter
      if (filter === 'horizontal') {
        planes = planes.filter(p => p.label === 'floor' || p.label === 'ceiling' || p.label === 'table')
      } else if (filter === 'vertical') {
        planes = planes.filter(p => p.label === 'wall' || p.label === 'door' || p.label === 'window')
      }

      setState({ supported: true, planes, isDetecting: true })
    }
  })

  return state
}
