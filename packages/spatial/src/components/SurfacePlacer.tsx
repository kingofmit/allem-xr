'use client'

import React, { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { SurfacePlacerProps } from '../types'
import { useHitTest } from '../hooks/useHitTest'

/**
 * Shows a preview at the hit test position. Tap/pinch to place.
 * Children are rendered as the placement preview.
 */
export function SurfacePlacer({
  onPlace,
  children,
  active = true,
}: SurfacePlacerProps) {
  const { results, supported } = useHitTest({ source: 'viewer' })
  const groupRef = useRef<Group>(null)
  const onPlaceRef = useRef(onPlace)
  onPlaceRef.current = onPlace

  // Update preview position each frame
  useFrame(() => {
    const group = groupRef.current
    if (!group || !active) {
      if (group) group.visible = false
      return
    }

    if (results.length > 0) {
      const hit = results[0]
      group.visible = true
      group.position.copy(hit.position)
      group.quaternion.copy(hit.rotation)
    } else {
      group.visible = false
    }
  })

  const handleSelect = useCallback(() => {
    if (!active || results.length === 0) return
    const hit = results[0]
    onPlaceRef.current(hit.position.clone(), hit.rotation.clone())
  }, [active, results])

  if (!supported) return null

  return (
    <group ref={groupRef} onClick={handleSelect}>
      {children}
    </group>
  )
}
