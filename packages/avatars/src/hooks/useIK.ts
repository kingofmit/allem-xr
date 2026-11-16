'use client'

import { useRef, useCallback, useState } from 'react'
import { Vector3, Quaternion } from 'three'
import { useFrame } from '@react-three/fiber'
import type { IKChain, IKEffector, IKState } from '../types'

// FABRIK iteration constants
const MAX_ITERATIONS = 10
const TOLERANCE = 0.001

/**
 * Simplified FABRIK (Forward And Backward Reaching Inverse Kinematics) solver.
 * Drives bone chains to reach IK targets.
 */
export function useIK(chains?: IKChain[]): IKState {
  const [isActive] = useState(true)
  const targetsRef = useRef<Map<IKEffector, { position: Vector3; rotation?: Quaternion }>>(new Map())
  const solvedBonesRef = useRef<Map<string, { position: Vector3; rotation: Quaternion }>>(new Map())

  const setTarget = useCallback((effector: IKEffector, position: Vector3, rotation?: Quaternion) => {
    const existing = targetsRef.current.get(effector)
    if (existing) {
      existing.position.copy(position)
      if (rotation) existing.rotation = existing.rotation?.copy(rotation) ?? rotation.clone()
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
      if (!target) continue

      // Get current bone positions (for real implementation, read from skeleton)
      // This is a simplified version that stores solved positions
      const positions: Vector3[] = chain.boneNames.map(name => {
        const existing = solvedBonesRef.current.get(name)
        return existing?.position.clone() ?? new Vector3()
      })

      if (positions.length < 2) continue

      // FABRIK solver
      const targetPos = target.position
      const lengths: number[] = []
      for (let i = 0; i < positions.length - 1; i++) {
        lengths.push(positions[i].distanceTo(positions[i + 1]))
      }

      for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        // Forward pass: from end effector to root
        positions[positions.length - 1].copy(targetPos)
        for (let i = positions.length - 2; i >= 0; i--) {
          const dir = positions[i].clone().sub(positions[i + 1]).normalize()
          positions[i].copy(positions[i + 1]).addScaledVector(dir, lengths[i])
        }

        // Backward pass: from root to end effector
        // (root stays fixed — use first bone's original position)
        const rootPos = solvedBonesRef.current.get(chain.boneNames[0])?.position
        if (rootPos) positions[0].copy(rootPos)

        for (let i = 0; i < positions.length - 1; i++) {
          const dir = positions[i + 1].clone().sub(positions[i]).normalize()
          positions[i + 1].copy(positions[i]).addScaledVector(dir, lengths[i])
        }

        // Check convergence
        const dist = positions[positions.length - 1].distanceTo(targetPos)
        if (dist < TOLERANCE) break
      }

      // Store solved positions
      for (let i = 0; i < chain.boneNames.length; i++) {
        const name = chain.boneNames[i]
        const existing = solvedBonesRef.current.get(name)
        if (existing) {
          existing.position.copy(positions[i])
        } else {
          solvedBonesRef.current.set(name, {
            position: positions[i].clone(),
            rotation: new Quaternion(),
          })
        }
      }
    }
  })

  return {
    isActive,
    setTarget,
    solvedBones: solvedBonesRef.current,
  }
}
