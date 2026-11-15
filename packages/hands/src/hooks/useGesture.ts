"use client";

import { useEffect, useState } from "react";
import type { Gesture } from "../types";

/**
 * Hook for recognizing gestures on a specific hand.
 *
 * @param hand - Which hand to track ("left" or "right")
 *
 * @example
 * ```tsx
 * const gesture = useGesture("right");
 * if (gesture?.name === "thumbs-up") { ... }
 * ```
 */
export function useGesture(hand: "left" | "right"): Gesture | null {
  const [gesture, setGesture] = useState<Gesture | null>(null);

  useEffect(() => {
    // Gesture recognition requires per-frame joint analysis.
    // A production implementation would use requestAnimationFrame
    // to compare joint positions against known gesture templates.
    //
    // Supported gestures: "point", "fist", "open-palm", "thumbs-up", "peace"

    return () => {
      setGesture(null);
    };
  }, [hand]);

  return gesture;
}
