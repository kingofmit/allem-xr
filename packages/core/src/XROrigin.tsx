'use client'

import React, { forwardRef } from 'react'
import type { Group } from 'three'

interface XROriginProps {
  children?: React.ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * XROrigin — represents the user's feet position in the scene.
 * Move this to teleport the user.
 */
export const XROrigin = forwardRef<Group, XROriginProps>(function XROrigin(
  { children, position = [0, 0, 0], rotation = [0, 0, 0] },
  ref
) {
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  )
})

export type { XROriginProps }
