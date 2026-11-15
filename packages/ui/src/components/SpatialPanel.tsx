"use client";

import { type CSSProperties, type ReactNode } from "react";

/** 3D position for spatial placement. */
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SpatialPanelProps {
  children: ReactNode;
  /** Position in 3D space (meters). */
  position?: Vector3;
  /** Whether the panel follows the user's head. */
  followGaze?: boolean;
  /** Panel width in meters. */
  width?: number;
  /** Panel height in meters. */
  height?: number;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * A floating panel in 3D space that can hold any React content.
 *
 * In an XR session, the panel is positioned at the given 3D coordinates.
 * Outside XR, it renders as a standard `div` for easy testing.
 *
 * @example
 * ```tsx
 * <SpatialPanel position={{ x: 0, y: 1.5, z: -1 }} width={0.4}>
 *   <h1>Hello, XR!</h1>
 * </SpatialPanel>
 * ```
 */
export function SpatialPanel({
  children,
  position,
  followGaze = false,
  width,
  height,
  className,
  style,
}: SpatialPanelProps) {
  // In a full implementation, this would create a WebXR layer or
  // three.js plane at the specified 3D position. For now, we render
  // a DOM element with data attributes for XR integration.

  return (
    <div
      className={className}
      style={style}
      data-xr-panel=""
      data-xr-position={position ? `${position.x},${position.y},${position.z}` : undefined}
      data-xr-follow-gaze={followGaze || undefined}
      data-xr-width={width}
      data-xr-height={height}
      role="region"
    >
      {children}
    </div>
  );
}
