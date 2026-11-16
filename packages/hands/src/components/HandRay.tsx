'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useXRContext, useXRFrame } from '@allem-xr/core'
import type { Group } from 'three'

interface HandRayProps {
  hand: 'left' | 'right'
  color?: string
  maxLength?: number
  opacity?: number
  visible?: boolean
}

/**
 * Renders a visible ray from the hand's index finger,
 * useful for pointing at distant UI elements.
 */
export function HandRay({
  hand,
  color = '#00ccff',
  maxLength = 3,
  opacity = 0.4,
  visible = true,
}: HandRayProps) {
  const ctx = useXRContext()
  const groupRef = useRef<Group>(null)
  // Pre-allocate geometry with 2 points
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(6) // 2 points × 3
    const attr = new THREE.BufferAttribute(positions, 3)
    attr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', attr)
    return geo
  }, [])

  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    [color, opacity]
  )

  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      lineObject.geometry?.dispose()
    }
  }, [geometry, material, lineObject])

  useXRFrame((frame, _delta, referenceSpace) => {
    const group = groupRef.current
    if (!group || !visible) {
      if (group) group.visible = false
      return
    }

    const state = ctx.getFrameState()
    let xrHand: XRHand | null = null
    for (const input of state.inputSources) {
      if (input.handedness === hand && input.hand) {
        xrHand = input.hand
        break
      }
    }

    if (!xrHand) {
      group.visible = false
      return
    }

    // Get index finger tip and proximal for direction
    const tipSpace = xrHand.get('index-finger-tip' as XRHandJoint)
    const proxSpace = xrHand.get('index-finger-phalanx-proximal' as XRHandJoint)
    if (!tipSpace || !proxSpace) {
      group.visible = false
      return
    }

    const tipPose = frame.getJointPose?.(tipSpace, referenceSpace)
    const proxPose = frame.getJointPose?.(proxSpace, referenceSpace)
    if (!tipPose || !proxPose) {
      group.visible = false
      return
    }

    group.visible = true

    // Direction from proximal to tip (forward pointing)
    const tipPos = tipPose.transform.position
    const proxPos = proxPose.transform.position
    const dirX = tipPos.x - proxPos.x
    const dirY = tipPos.y - proxPos.y
    const dirZ = tipPos.z - proxPos.z
    const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ)

    if (len < 0.001) {
      group.visible = false
      return
    }

    const nx = dirX / len
    const ny = dirY / len
    const nz = dirZ / len

    const attr = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    // Start point
    arr[0] = tipPos.x
    arr[1] = tipPos.y
    arr[2] = tipPos.z
    // End point
    arr[3] = tipPos.x + nx * maxLength
    arr[4] = tipPos.y + ny * maxLength
    arr[5] = tipPos.z + nz * maxLength
    attr.needsUpdate = true
  })

  if (!visible) return null

  return (
    <group ref={groupRef}>
      <primitive object={lineObject} />
    </group>
  )
}
