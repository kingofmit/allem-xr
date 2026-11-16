'use client'

import React, { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { useAvatar } from '../hooks/useAvatar'
import { useAvatarTracking } from '../hooks/useAvatarTracking'
import type { AvatarProps } from '../types'

/**
 * Full avatar with automatic XR tracking.
 * Loads a GLB/VRM model and drives it from head + hand tracking.
 */
export function Avatar({
  model,
  trackHead = true,
  trackHands = true,
  estimateBody = true,
  scale = 1,
  castShadow = false,
  position = [0, 0, 0],
}: AvatarProps) {
  const groupRef = useRef<Group>(null)
  const avatar = useAvatar({ modelUrl: model, scale, ikEnabled: true })

  useAvatarTracking(avatar, { head: trackHead, hands: trackHands, estimateBody })

  // Add loaded scene to group
  useEffect(() => {
    const group = groupRef.current
    if (!group || !avatar.scene) return

    group.add(avatar.scene)

    if (castShadow) {
      avatar.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }

    return () => {
      if (avatar.scene) {
        group.remove(avatar.scene)
      }
    }
  }, [avatar.scene, avatar.isLoaded, castShadow])

  return <group ref={groupRef} position={position} />
}
