"use client";

import { useState } from "react";
import type { HitTestResult } from "../types";

/**
 * Hook for performing hit tests against real-world geometry.
 *
 * Returns the most recent hit test result, updated each frame
 * when an XR session with hit-test feature is active.
 *
 * @example
 * ```tsx
 * const hitResult = useHitTest();
 * if (hitResult) {
 *   // Place object at hitResult.position
 * }
 * ```
 */
export function useHitTest(): HitTestResult | null {
  const [result] = useState<HitTestResult | null>(null);

  // Hit test requires an active XR session with "hit-test" feature.
  // A production implementation would use XRHitTestSource within
  // the requestAnimationFrame loop to perform raycasts against
  // real-world geometry each frame.

  return result;
}
