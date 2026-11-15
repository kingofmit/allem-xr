"use client";

import { useCallback, useState } from "react";
import type { Quaternion, SpatialAnchor, SpatialAnchorState, Vector3 } from "../types";

/**
 * Hook for creating and managing persistent spatial anchors.
 *
 * @example
 * ```tsx
 * const { anchors, createAnchor, deleteAnchor } = useSpatialAnchor();
 * ```
 */
export function useSpatialAnchor(): SpatialAnchorState {
  const [anchors, setAnchors] = useState<SpatialAnchor[]>([]);

  const createAnchor = useCallback(
    async (position: Vector3, orientation?: Quaternion): Promise<SpatialAnchor | null> => {
      const anchor: SpatialAnchor = {
        id: crypto.randomUUID(),
        position,
        orientation: orientation ?? { x: 0, y: 0, z: 0, w: 1 },
        createdAt: Date.now(),
        isTracking: true,
      };

      setAnchors((prev) => [...prev, anchor]);
      return anchor;
    },
    [],
  );

  const deleteAnchor = useCallback(async (id: string) => {
    setAnchors((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { anchors, createAnchor, deleteAnchor };
}
