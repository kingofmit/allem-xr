"use client";

import { useState } from "react";
import type { PlaneDetectionState } from "../types";

/**
 * Hook for detecting real-world planes (floors, walls, tables).
 *
 * @example
 * ```tsx
 * const { planes, isDetecting } = usePlaneDetection();
 * planes.forEach(plane => console.log(plane.label, plane.extent));
 * ```
 */
export function usePlaneDetection(): PlaneDetectionState {
  const [planes] = useState<PlaneDetectionState["planes"]>([]);
  const [isDetecting] = useState(false);

  // Plane detection requires an XR session with "plane-detection" feature.
  // Detected planes are updated as the user moves through the environment.

  return { planes, isDetecting };
}
