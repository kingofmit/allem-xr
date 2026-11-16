'use client'

import { useRef, useCallback, useState } from 'react'
import { Vector3, Quaternion } from 'three'
import { useFrame } from '@react-three/fiber'
import type { IKChain, IKEffector, IKState } from '../types'

const MAX_ITERATIONS = 10
const TOLERANCE = 0.001
const MAX_BONES_PER_CHAIN = 20

// Pre-allocated work vectors for FABRIK solver
const _dir = new Vector3()
const _rootStore = new Vector3()

/**
 * Simplified FABRIK IK solver. Pre-allocates all vectors to avoid frame-loop garbage.
 */
export function useIK(chains?: IKChain[]): IKState {
  const [isActive] = useState(true)
  const targetsRef = useRef<Map<IKEffector, { position: Vector3; rotation?: Quaternion }>>(new Map())
  const solvedBonesRef = useRef<Map<string, { position: Vector3; rotation: Quaternion }>>(new Map())

  // Pre-allocate position arrays for each chain (done once)
  const chainPositionsRef = useRef<Map<string, Vector3[]>>(new Map())
  const chainLengthsRef = useRef<Map<string, number[]>>(new Map())

  const setTarget = useCallback((effector: IKEffector, position: Vector3, rotation?: Quaternion) => {
    const existing = targetsRef.current.get(effector)
    if (existing) {
      existing.position.copy(position)
      if (rotation) {
        if (existing.rotation) {
          existing.rotation.copy(rotation)
        } else {
          existing.rotation = rotation.clone()
        }
      }
    } else {
      targetsRef.current.set(effector, {
        position: position.clone(),
        rotation: rotation?.clone(),
      })
    }
  }, [])

  // Solve IK each frame
  useFrame(() => {
    if (!chains || chains.length === 0) return

    for (const chain of chains) {
      const target = targetsRef.current.get(chain.target.effector)
      if (!target || chain.boneNames.length < 2) continue

      // Ensure pre-allocated arrays exist for this chain
      let positions = chainPositionsRef.current.get(chain.name)
      let lengths = chainLengthsRef.current.get(chain.name)

      if (!positions || positions.length !== chain.boneNames.length) {
        positions = chain.boneNames.map(() => new Vector3())
        chainPositionsRef.current.set(chain.name, positions)
        lengths = new Array(chain.boneNames.length - 1).fill(0)
        chainLengthsRef.current.set(chain.name, lengths)
      }

      // Copy current solved positions into work array
      for (let i = 0; i < chain.boneNames.length; i++) {
        const existing = solvedBonesRef.current.get(chain.boneNames[i])
        if (existing) {
          positions[i].copy(existing.position)
        }
      }

      // Compute bone lengths (only if not set or first frame)
      if (lengths![0] === 0) {
        for (let i = 0; i < positions.length - 1; i++) {
          lengths![i] = positions[i].distanceTo(positions[i + 1])
          if (lengths![i] === 0) lengths![i] = 0.1 // Default bone length
        }
      }

      // Store root position
      _rootStore.copy(positions[0])

      // FABRIK solver — zero allocations
      for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        // Forward pass: end effector → root
        positions[positions.length - 1].copy(target.position)
        for (let i = positions.length - 2; i >= 0; i--) {
          _dir.subVectors(positions[i], positions[i + 1]).normalize()
          positions[i].copy(positions[i + 1]).addScaledVector(_dir, lengths![i])
        }

        // Backward pass: root → end effector (root stays fixed)
        positions[0].copy(_rootStore)
        for (let i = 0; i < positions.length - 1; i++) {
          _dir.subVectors(positions[i + 1], positions[i]).normalize()
          positions[i + 1].copy(positions[i]).addScaledVector(_dir, lengths![i])
        }

        // Convergence check
        if (positions[positions.length - 1].distanceTo(target.position) < TOLERANCE) break
      }

      // Store solved positions (no new allocations)
      for (let i = 0; i < chain.boneNames.length; i++) {
        const name = chain.boneNames[i]
        let existing = solvedBonesRef.current.get(name)
        if (!existing) {
          existing = { position: new Vector3(), rotation: new Quaternion() }
          solvedBonesRef.current.set(name, existing)
        }
        existing.position.copy(positions[i])
      }
    }
  })

  return { isActive, setTarget, solvedBones: solvedBonesRef.current }
}
