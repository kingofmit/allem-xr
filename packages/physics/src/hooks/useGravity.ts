'use client'

import { useCallback, useState, useEffect } from 'react'
import { usePhysicsContext } from '../context'
import type { GravityState } from '../types'

/**
 * Read and control gravity in the physics world.
 */
export function useGravity(): GravityState {
  const { world, ready } = usePhysicsContext()
  const [gravity, setGravityState] = useState<[number, number, number]>([0, -9.81, 0])

  // Sync initial gravity from world when ready
  useEffect(() => {
    if (world && ready) {
      const g = world.gravity
      setGravityState([g.x, g.y, g.z])
    }
  }, [world, ready])

  const setGravity = useCallback((g: [number, number, number]) => {
    if (!world || !ready) return
    world.gravity = { x: g[0], y: g[1], z: g[2] }
    setGravityState(g)
  }, [world, ready])

  return { gravity, setGravity }
}
