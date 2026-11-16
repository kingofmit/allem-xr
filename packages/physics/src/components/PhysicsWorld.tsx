'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { PhysicsContext } from '../context'
import type { PhysicsContextValue, PhysicsWorldConfig } from '../types'
import type { World, RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat'

interface PhysicsWorldProps extends PhysicsWorldConfig {
  children: ReactNode
  /** Pause physics simulation */
  paused?: boolean
  /** Interpolate transforms between physics steps for smoother rendering */
  interpolate?: boolean
}

export function PhysicsWorld({
  children,
  gravity = [0, -9.81, 0],
  timestep = 1 / 72,
  ccd = false,
  paused = false,
  interpolate = true,
}: PhysicsWorldProps) {
  const [rapier, setRapier] = useState<typeof import('@dimforge/rapier3d-compat') | null>(null)
  const worldRef = useRef<World | null>(null)
  const bodiesRef = useRef<Map<string, RapierRigidBody>>(new Map())
  const [ready, setReady] = useState(false)

  // Initialize Rapier WASM
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const RAPIER = await import('@dimforge/rapier3d-compat')
        await RAPIER.init()

        if (cancelled) return

        const world = new RAPIER.World({ x: gravity[0], y: gravity[1], z: gravity[2] })
        world.timestep = timestep

        worldRef.current = world
        setRapier(RAPIER)
        setReady(true)
      } catch (e) {
        console.error('[allem-xr] Failed to initialize Rapier physics:', e)
      }
    }

    init()

    return () => {
      cancelled = true
      if (worldRef.current) {
        worldRef.current.free()
        worldRef.current = null
      }
    }
  }, []) // Only init once

  // Update gravity when it changes
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.gravity = { x: gravity[0], y: gravity[1], z: gravity[2] }
    }
  }, [gravity[0], gravity[1], gravity[2]])

  // Update timestep when it changes
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.timestep = timestep
    }
  }, [timestep])

  // Step physics each frame (before render)
  useFrame((_state, delta) => {
    const world = worldRef.current
    if (!world || paused) return

    world.step()
  })

  const registerBody = useCallback((id: string, body: RapierRigidBody) => {
    bodiesRef.current.set(id, body)
  }, [])

  const unregisterBody = useCallback((id: string) => {
    bodiesRef.current.delete(id)
  }, [])

  const contextValue = useMemo<PhysicsContextValue>(
    () => ({
      world: worldRef.current,
      ready,
      bodies: bodiesRef.current,
      registerBody,
      unregisterBody,
      rapier,
    }),
    [ready, rapier, registerBody, unregisterBody]
  )

  return (
    <PhysicsContext.Provider value={contextValue}>
      {children}
    </PhysicsContext.Provider>
  )
}
