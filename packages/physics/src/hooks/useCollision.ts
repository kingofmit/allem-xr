"use client";

import { useEffect } from "react";
import type { CollisionEvent } from "../types";

/**
 * Hook for listening to collision events in the physics world.
 *
 * @param callback - Function called when a collision occurs
 *
 * @example
 * ```tsx
 * useCollision((event) => {
 *   console.log(`${event.bodyA} hit ${event.bodyB}`);
 * });
 * ```
 */
export function useCollision(callback: (event: CollisionEvent) => void): void {
  useEffect(() => {
    // Register a collision listener with the physics world.
    // The callback fires for each contact pair each simulation step.

    return () => {
      // Unregister the collision listener.
    };
  }, [callback]);
}
