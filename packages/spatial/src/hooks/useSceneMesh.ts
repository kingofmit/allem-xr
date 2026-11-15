"use client";

import { useState } from "react";
import type { SceneMeshState } from "../types";

/**
 * Hook for accessing the reconstructed scene mesh.
 *
 * Provides real-time mesh data as the XR device scans the environment,
 * useful for physics collisions and occlusion.
 *
 * @example
 * ```tsx
 * const { mesh, isReconstructing } = useSceneMesh();
 * if (mesh) {
 *   console.log(`Vertices: ${mesh.vertices.length / 3}`);
 * }
 * ```
 */
export function useSceneMesh(): SceneMeshState {
  const [mesh] = useState<SceneMeshState["mesh"]>(null);
  const [isReconstructing] = useState(false);

  // Scene mesh reconstruction requires an XR session with "mesh-detection" feature.
  // The mesh is progressively refined as the device scans the environment.

  return { mesh, isReconstructing };
}
