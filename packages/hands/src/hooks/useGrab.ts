"use client";

import { useEffect, useState } from "react";
import type { GrabState } from "../types";

const DEFAULT_GRAB: GrabState = {
  isGrabbing: false,
  strength: 0,
};

/**
 * Hook for detecting grab gestures (closed fist).
 *
 * @param hand - Which hand to track ("left" or "right")
 * @param threshold - Strength threshold (0-1) to trigger grab (default: 0.7)
 *
 * @example
 * ```tsx
 * const { isGrabbing, strength } = useGrab("right");
 * ```
 */
export function useGrab(hand: "left" | "right", threshold = 0.7): GrabState {
  const [grab, setGrab] = useState<GrabState>(DEFAULT_GRAB);

  useEffect(() => {
    // Grab detection measures curl of all fingers.
    // Strength ranges from 0 (open hand) to 1 (closed fist).
    // When strength > threshold, isGrabbing becomes true.

    return () => {
      setGrab(DEFAULT_GRAB);
    };
  }, [hand, threshold]);

  return grab;
}
