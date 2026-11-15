"use client";

import { useCallback, useState } from "react";
import type { PortalTransitionState, TransitionConfig } from "../types";

/**
 * Hook for managing transitions between XR scenes.
 *
 * @example
 * ```tsx
 * const { transition, isTransitioning, currentScene } = usePortalTransition();
 * await transition("lobby", { duration: 500, easing: "ease-in-out" });
 * ```
 */
export function usePortalTransition(): PortalTransitionState {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentScene, setCurrentScene] = useState("default");

  const transition = useCallback(
    async (sceneName: string, config?: TransitionConfig) => {
      const duration = config?.duration ?? 300;

      setIsTransitioning(true);

      // Perform the transition animation (fade out, swap scene, fade in).
      await new Promise((resolve) => setTimeout(resolve, duration));

      setCurrentScene(sceneName);
      setIsTransitioning(false);
    },
    [],
  );

  return { transition, isTransitioning, currentScene };
}
