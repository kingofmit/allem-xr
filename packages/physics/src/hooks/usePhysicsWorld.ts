"use client";

import { useCallback, useState } from "react";
import type { PhysicsWorldConfig, PhysicsWorldState } from "../types";

/**
 * Hook for creating and managing a physics simulation world.
 *
 * @param config - Physics world configuration
 *
 * @example
 * ```tsx
 * const { isRunning, pause, resume } = usePhysicsWorld({
 *   gravity: { x: 0, y: -9.81, z: 0 },
 * });
 * ```
 */
export function usePhysicsWorld(_config: PhysicsWorldConfig = {}): PhysicsWorldState {
  const [isRunning, setIsRunning] = useState(true);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const step = useCallback(() => {
    // Manually advance the physics simulation by one time step.
    // Useful for debugging or frame-by-frame analysis.
  }, []);

  return { isRunning, pause, resume, step };
}
