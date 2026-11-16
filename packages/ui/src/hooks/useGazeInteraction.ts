'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface GazeInteractionOptions {
  dwellTime?: number
  onGazeEnter?: () => void
  onGazeExit?: () => void
  onDwell?: () => void
}

const _raycaster = new THREE.Raycaster()
const _gazeScreenCenter = new THREE.Vector2(0, 0)

/**
 * Gaze-based interaction for any R3F object.
 * Triggers onDwell after the user looks at the object for dwellTime ms.
 */
export function useGazeInteraction(
  meshRef: React.RefObject<THREE.Object3D>,
  options: GazeInteractionOptions
) {
  const { camera } = useThree()
  const { dwellTime = 800 } = options
  const optionsRef = useRef(options)
  optionsRef.current = options

  const isGazingRef = useRef(false)
  const gazeStartRef = useRef(0)
  const dwelledRef = useRef(false)
  const [gazing, setGazing] = useState(false)

  useFrame(() => {
    if (!meshRef.current) return

    _raycaster.setFromCamera(_gazeScreenCenter, camera)
    const hits = _raycaster.intersectObject(meshRef.current, true)
    const isHit = hits.length > 0

    if (isHit && !isGazingRef.current) {
      // Gaze enter
      isGazingRef.current = true
      gazeStartRef.current = performance.now()
      dwelledRef.current = false
      setGazing(true)
      optionsRef.current.onGazeEnter?.()
    } else if (!isHit && isGazingRef.current) {
      // Gaze exit
      isGazingRef.current = false
      dwelledRef.current = false
      setGazing(false)
      optionsRef.current.onGazeExit?.()
    }

    // Check dwell
    if (isGazingRef.current && !dwelledRef.current) {
      const elapsed = performance.now() - gazeStartRef.current
      if (elapsed >= dwellTime) {
        dwelledRef.current = true
        optionsRef.current.onDwell?.()
      }
    }
  })

  return { gazing }
}
