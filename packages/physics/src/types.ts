/** 3D position vector. */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Quaternion rotation. */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** Rigid body type. */
export type RigidBodyType = "static" | "dynamic" | "kinematic";

/** Collider shape. */
export type ColliderShape = "box" | "sphere" | "capsule" | "mesh";

/** Physics world configuration. */
export interface PhysicsWorldConfig {
  /** Gravity vector (default: { x: 0, y: -9.81, z: 0 }). */
  gravity?: Vector3;
  /** Simulation time step in seconds (default: 1/60). */
  timeStep?: number;
  /** Maximum sub-steps per frame (default: 3). */
  maxSubSteps?: number;
}

/** A collision event between two bodies. */
export interface CollisionEvent {
  bodyA: string;
  bodyB: string;
  contactPoint: Vector3;
  normal: Vector3;
  impulse: number;
}

/** Return type for usePhysicsWorld. */
export interface PhysicsWorldState {
  /** Whether the physics simulation is running. */
  isRunning: boolean;
  /** Pause the simulation. */
  pause: () => void;
  /** Resume the simulation. */
  resume: () => void;
  /** Step the simulation manually (for debugging). */
  step: () => void;
}

/** Return type for useGravity. */
export interface GravityState {
  gravity: Vector3;
  setGravity: (gravity: Vector3) => void;
}
