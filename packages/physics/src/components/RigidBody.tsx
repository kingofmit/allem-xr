"use client";

import type { ReactNode } from "react";
import type { ColliderShape, Quaternion, RigidBodyType, Vector3 } from "../types";

export interface RigidBodyProps {
  children: ReactNode;
  /** Body type: static (immovable), dynamic (simulated), or kinematic (scripted). */
  type?: RigidBodyType;
  /** Mass in kilograms (only for dynamic bodies). */
  mass?: number;
  /** Initial position. */
  position?: Vector3;
  /** Initial rotation. */
  rotation?: Quaternion;
  /** Collider shape. */
  collider?: ColliderShape;
  /** Restitution (bounciness, 0-1). */
  restitution?: number;
  /** Friction coefficient (0-1). */
  friction?: number;
}

/**
 * Wraps children in a physics-simulated rigid body.
 *
 * @example
 * ```tsx
 * <RigidBody type="dynamic" mass={1} position={{ x: 0, y: 2, z: 0 }}>
 *   <mesh />
 * </RigidBody>
 * ```
 */
export function RigidBody({
  children,
  type = "dynamic",
  mass = 1,
  position,
  rotation,
  collider = "box",
  restitution = 0.3,
  friction = 0.5,
}: RigidBodyProps) {
  return (
    <div
      data-xr-rigid-body=""
      data-xr-body-type={type}
      data-xr-mass={mass}
      data-xr-position={position ? `${position.x},${position.y},${position.z}` : undefined}
      data-xr-rotation={
        rotation ? `${rotation.x},${rotation.y},${rotation.z},${rotation.w}` : undefined
      }
      data-xr-collider={collider}
      data-xr-restitution={restitution}
      data-xr-friction={friction}
    >
      {children}
    </div>
  );
}
