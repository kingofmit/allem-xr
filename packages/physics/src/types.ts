import type { Vector3, Quaternion as ThreeQuat } from 'three'
import type { RigidBody as RapierRigidBody, World, Collider } from '@dimforge/rapier3d-compat'

export type RigidBodyType = 'dynamic' | 'fixed' | 'kinematic-position' | 'kinematic-velocity'

export type ColliderShape = 'cuboid' | 'ball' | 'capsule' | 'trimesh' | 'convex-hull' | 'auto'

export interface PhysicsWorldConfig {
  /** Gravity vector. Default: [0, -9.81, 0] */
  gravity?: [number, number, number]
  /** Fixed timestep in seconds. Default: 1/72 (Quest refresh rate) */
  timestep?: number
  /** Enable CCD for fast-moving objects */
  ccd?: boolean
}

export interface PhysicsContextValue {
  /** The Rapier world instance */
  world: World | null
  /** Whether Rapier WASM is loaded and ready */
  ready: boolean
  /** Map of body IDs to Rapier rigid bodies */
  bodies: Map<string, RapierRigidBody>
  /** Register a rigid body */
  registerBody: (id: string, body: RapierRigidBody) => void
  /** Unregister a rigid body */
  unregisterBody: (id: string) => void
  /** Rapier module (for creating descriptions, etc.) */
  rapier: typeof import('@dimforge/rapier3d-compat') | null
}

export interface RigidBodyProps {
  children: React.ReactNode
  /** Body type. Default: 'dynamic' */
  type?: RigidBodyType
  /** Mass in kg (dynamic only). Default: 1 */
  mass?: number
  /** Initial position */
  position?: [number, number, number]
  /** Initial rotation [x, y, z] euler angles */
  rotation?: [number, number, number]
  /** Collider shape. 'auto' infers from child geometry. Default: 'auto' */
  collider?: ColliderShape
  /** Collider size args (shape-dependent). For cuboid: [hx,hy,hz]. For ball: [radius]. */
  args?: number[]
  /** Bounciness 0-1. Default: 0.3 */
  restitution?: number
  /** Friction coefficient 0-1. Default: 0.7 */
  friction?: number
  /** Linear damping. Default: 0.05 */
  linearDamping?: number
  /** Angular damping. Default: 0.05 */
  angularDamping?: number
  /** Enable continuous collision detection */
  ccd?: boolean
  /** Collision callback */
  onCollision?: (event: CollisionEvent) => void
  /** Unique name for this body */
  name?: string
}

export interface CollisionEvent {
  /** The other body's name */
  other: string
  /** Contact point in world space */
  contactPoint: Vector3
  /** Contact normal */
  normal: Vector3
  /** Impact impulse magnitude */
  impulse: number
}

export interface RealWorldColliderProps {
  /** Source of real-world geometry */
  source: 'planes'
  /** Friction for real-world surfaces. Default: 0.8 */
  friction?: number
  /** Restitution for real-world surfaces. Default: 0.2 */
  restitution?: number
}

export interface GravityState {
  gravity: [number, number, number]
  setGravity: (gravity: [number, number, number]) => void
}
