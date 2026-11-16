'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { GuardianState } from '../types'

/**
 * Track user proximity to the guardian boundary.
 */
export function useGuardian(radius: number = 2, fadeDistance: number = 0.5): GuardianState {
  const { camera } = useThree()
  const [state, setState] = useState<GuardianState>({
    isNearBoundary: false,
    distanceToBoundary: radius,
  })
  const prevNearRef = useRef(false)

  useFrame(() => {
    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
    const distToBoundary = Math.max(0, radius - dist)
    const isNear = distToBoundary < fadeDistance

    if (isNear !== prevNearRef.current) {
      prevNearRef.current = isNear
      setState({ isNearBoundary: isNear, distanceToBoundary: distToBoundary })
    }
  })

  return state
}
