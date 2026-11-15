"use client";

import { useCallback, useState } from "react";
import type { GravityState, Vector3 } from "../types";

const DEFAULT_GRAVITY: Vector3 = { x: 0, y: -9.81, z: 0 };

/**
 * Hook for reading and modifying the gravity vector.
 *
 * @param initial - Initial gravity vector (default: Earth gravity)
 *
 * @example
 * ```tsx
 * const { gravity, setGravity } = useGravity();
 * // Moon gravity:
 * setGravity({ x: 0, y: -1.62, z: 0 });
 * ```
 */
export function useGravity(initial: Vector3 = DEFAULT_GRAVITY): GravityState {
  const [gravity, setGravityState] = useState<Vector3>(initial);

  const setGravity = useCallback((newGravity: Vector3) => {
    setGravityState(newGravity);
    // Update the physics world gravity vector.
  }, []);

  return { gravity, setGravity };
}
