import type { Vector3, Quaternion, Group, Object3D } from 'three'

export type IKEffector = 'head' | 'leftHand' | 'rightHand' | 'hips' | 'leftFoot' | 'rightFoot'

export interface IKTarget {
  effector: IKEffector
  position: Vector3
  rotation?: Quaternion
  weight?: number
}

export interface IKChain {
  name: string
  boneNames: string[]
  target: IKTarget
}

export interface IKState {
  isActive: boolean
  setTarget: (effector: IKEffector, position: Vector3, rotation?: Quaternion) => void
  solvedBones: Map<string, { position: Vector3; rotation: Quaternion }>
}

export interface AvatarConfig {
  modelUrl: string
  scale?: number
  ikEnabled?: boolean
}

export interface AvatarState {
  isLoaded: boolean
  scene: Group | null
  setIKTarget: (effector: IKEffector, position: Vector3, rotation?: Quaternion) => void
  bones: Map<string, Object3D>
}

export interface AvatarProps {
  model: string
  trackHead?: boolean
  trackHands?: boolean
  estimateBody?: boolean
  scale?: number
  castShadow?: boolean
  position?: [number, number, number]
}

export interface AvatarMirrorProps {
  position?: [number, number, number]
  width?: number
  height?: number
  resolution?: number
}
