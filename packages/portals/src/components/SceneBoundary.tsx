"use client";

import type { CSSProperties } from "react";
import type { Vector3 } from "../types";

export interface SceneBoundaryProps {
  /** Whether to render the guardian/boundary visualization. */
  showGuardian?: boolean;
  /** Guardian boundary color. */
  color?: string;
  /** Center of the playspace. */
  center?: Vector3;
  /** Radius of the playspace in meters. */
  radius?: number;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * Renders the XR playspace boundary (guardian system).
 *
 * Shows a visual indicator when the user approaches the edge
 * of their configured play area.
 *
 * @example
 * ```tsx
 * <SceneBoundary showGuardian color="rgba(0, 150, 255, 0.3)" radius={2} />
 * ```
 */
export function SceneBoundary({
  showGuardian = true,
  color = "rgba(0, 150, 255, 0.3)",
  center = { x: 0, y: 0, z: 0 },
  radius = 2,
  className,
  style,
}: SceneBoundaryProps) {
  if (!showGuardian) return null;

  return (
    <div
      className={className}
      style={style}
      data-xr-boundary=""
      data-xr-center={`${center.x},${center.y},${center.z}`}
      data-xr-radius={radius}
      data-xr-color={color}
      aria-hidden="true"
    />
  );
}
