"use client";

import { useCallback, useState } from "react";
import type { AvatarConfig, AvatarState, IKTarget, Skeleton } from "../types";

/**
 * Hook for loading and managing an avatar with IK-driven animation.
 *
 * @param config - Avatar configuration (model URL, initial skeleton, etc.)
 *
 * @example
 * ```tsx
 * const avatar = useAvatar({ modelUrl: "/models/avatar.glb" });
 * avatar.setIKTarget({ effector: "rightHand", position: { x: 0.3, y: 1.2, z: -0.5 } });
 * ```
 */
export function useAvatar(config: AvatarConfig = {}): AvatarState {
  const [isLoaded] = useState(false);
  const [skeleton] = useState<Skeleton | null>(config.skeleton ?? null);
  const [ikTargets, setIKTargets] = useState<IKTarget[]>([]);

  const setIKTarget = useCallback((target: IKTarget) => {
    setIKTargets((prev) => {
      const existing = prev.findIndex((t) => t.effector === target.effector);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = target;
        return next;
      }
      return [...prev, target];
    });
  }, []);

  return { isLoaded, skeleton, ikTargets, setIKTarget, config };
}
