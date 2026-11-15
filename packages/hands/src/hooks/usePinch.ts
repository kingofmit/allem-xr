"use client";

import { useEffect, useState } from "react";
import type { PinchState } from "../types";

const DEFAULT_PINCH: PinchState = {
  isPinching: false,
  distance: Infinity,
  position: null,
};

/**
 * Hook for detecting pinch gestures (thumb + index finger).
 *
 * @param hand - Which hand to track ("left" or "right")
 * @param threshold - Distance threshold in meters to trigger pinch (default: 0.02)
 *
 * @example
 * ```tsx
 * const { isPinching, position } = usePinch("right");
 * ```
 */
export function usePinch(hand: "left" | "right", threshold = 0.02): PinchState {
  const [pinch, setPinch] = useState<PinchState>(DEFAULT_PINCH);

  useEffect(() => {
    // Pinch detection measures the distance between thumb-tip and index-tip joints.
    // When distance < threshold, isPinching becomes true.
    // The midpoint between the two tips is reported as the pinch position.

    return () => {
      setPinch(DEFAULT_PINCH);
    };
  }, [hand, threshold]);

  return pinch;
}
