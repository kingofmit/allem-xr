'use client'

import { createContext, useContext, useRef } from 'react'
import type { Object3D } from 'three'

export interface UIState {
  hoveredId: string | null
  activeId: string | null
  pointerId: string | null
}

export interface UIContextValue {
  state: React.MutableRefObject<UIState>
  register: (id: string, mesh: Object3D, callbacks: UICallbacks) => void
  unregister: (id: string) => void
}

export interface UICallbacks {
  onHover?: () => void
  onUnhover?: () => void
  onSelect?: () => void
  onDrag?: (delta: { x: number; y: number }) => void
}

export const UIContext = createContext<UIContextValue | null>(null)

export function useUIContext(): UIContextValue | null {
  return useContext(UIContext)
}
