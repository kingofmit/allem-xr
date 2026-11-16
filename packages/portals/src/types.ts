import type { Vector3 } from 'three'

export type TransitionEffect = 'fade' | 'dissolve' | 'iris'

export interface TransitionConfig {
  duration?: number
  effect?: TransitionEffect
  fadeColor?: string
}

export interface PortalProps {
  children?: React.ReactNode
  position?: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]
  onEnter?: () => void
  onExit?: () => void
  renderBorder?: boolean
  borderColor?: string
  borderWidth?: number
}

export interface SceneTransitionProps {
  active: boolean
  duration?: number
  effect?: TransitionEffect
  color?: string
  onComplete?: () => void
}

export interface GuardianProps {
  radius?: number
  color?: string
  opacity?: number
  fadeDistance?: number
  segments?: number
  height?: number
  onBreach?: () => void
  visible?: boolean
}

export interface PassthroughWindowProps {
  position?: [number, number, number]
  size?: [number, number]
  shape?: 'rectangle' | 'circle'
}

export interface SceneTransitionState {
  transition: (config?: TransitionConfig) => Promise<void>
  isTransitioning: boolean
}

export interface GuardianState {
  isNearBoundary: boolean
  distanceToBoundary: number
}
