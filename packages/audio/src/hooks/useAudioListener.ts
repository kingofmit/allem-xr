'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { getAudioContext } from '../audioContext'

// Cached to avoid frame allocations
const _forward = { x: 0, y: 0, z: -1 }
const _up = { x: 0, y: 1, z: 0 }

/**
 * Syncs the Web Audio API listener to the camera position.
 * Auto-syncs in XR mode — call this once inside XRScene.
 */
export function useAudioListener() {
  const { camera } = useThree()
  const listenerInitRef = useRef(false)

  useFrame(() => {
    const ctx = getAudioContext()
    const listener = ctx.listener

    // Set position
    if (listener.positionX) {
      listener.positionX.setValueAtTime(camera.position.x, ctx.currentTime)
      listener.positionY.setValueAtTime(camera.position.y, ctx.currentTime)
      listener.positionZ.setValueAtTime(camera.position.z, ctx.currentTime)
    }

    // Set orientation from camera matrix
    const m = camera.matrixWorld.elements
    // Forward direction (negative Z in camera space)
    _forward.x = -m[8]
    _forward.y = -m[9]
    _forward.z = -m[10]
    // Up direction (Y in camera space)
    _up.x = m[4]
    _up.y = m[5]
    _up.z = m[6]

    if (listener.forwardX) {
      listener.forwardX.setValueAtTime(_forward.x, ctx.currentTime)
      listener.forwardY.setValueAtTime(_forward.y, ctx.currentTime)
      listener.forwardZ.setValueAtTime(_forward.z, ctx.currentTime)
      listener.upX.setValueAtTime(_up.x, ctx.currentTime)
      listener.upY.setValueAtTime(_up.y, ctx.currentTime)
      listener.upZ.setValueAtTime(_up.z, ctx.currentTime)
    }
  })
}
