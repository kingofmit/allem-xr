'use client'

import React, { useRef, useCallback, useMemo, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { UIContext, type UIContextValue, type UIState, type UICallbacks } from '../context'

interface UIProviderProps {
  children: ReactNode
}

interface RegisteredUI {
  mesh: THREE.Object3D
  callbacks: UICallbacks
}

const _raycaster = new THREE.Raycaster()
const _screenCenter = new THREE.Vector2(0, 0)

/**
 * UIProvider — manages interaction between XR inputs and spatial UI elements.
 * Place inside XRScene, wrapping your UI components.
 */
export function UIProvider({ children }: UIProviderProps) {
  const { camera } = useThree()
  const registryRef = useRef<Map<string, RegisteredUI>>(new Map())
  const stateRef = useRef<UIState>({ hoveredId: null, activeId: null, pointerId: null })
  const prevHoveredRef = useRef<string | null>(null)

  const register = useCallback((id: string, mesh: THREE.Object3D, callbacks: UICallbacks) => {
    registryRef.current.set(id, { mesh, callbacks })
  }, [])

  const unregister = useCallback((id: string) => {
    registryRef.current.delete(id)
    if (stateRef.current.hoveredId === id) {
      stateRef.current.hoveredId = null
    }
    if (stateRef.current.activeId === id) {
      stateRef.current.activeId = null
    }
  }, [])

  // Raycast from camera center each frame (works for gaze, mouse, and controller)
  useFrame(() => {
    const meshes: THREE.Object3D[] = []
    const idMap = new Map<THREE.Object3D, string>()

    for (const [id, entry] of registryRef.current) {
      meshes.push(entry.mesh)
      idMap.set(entry.mesh, id)
    }

    if (meshes.length === 0) return

    // Cast ray from camera center (gaze direction)
    _raycaster.setFromCamera(_screenCenter, camera)

    const intersects = _raycaster.intersectObjects(meshes, true)

    let hitId: string | null = null
    if (intersects.length > 0) {
      // Walk up the parent chain to find the registered object
      let obj: THREE.Object3D | null = intersects[0].object
      while (obj) {
        if (idMap.has(obj)) {
          hitId = idMap.get(obj)!
          break
        }
        obj = obj.parent
      }
    }

    // Handle hover transitions
    if (hitId !== prevHoveredRef.current) {
      // Unhover previous
      if (prevHoveredRef.current) {
        const prev = registryRef.current.get(prevHoveredRef.current)
        prev?.callbacks.onUnhover?.()
      }
      // Hover new
      if (hitId) {
        const entry = registryRef.current.get(hitId)
        entry?.callbacks.onHover?.()
      }
      prevHoveredRef.current = hitId
      stateRef.current.hoveredId = hitId
    }
  })

  const contextValue = useMemo<UIContextValue>(
    () => ({ state: stateRef, register, unregister }),
    [register, unregister]
  )

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  )
}
