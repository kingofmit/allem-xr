"use client";

import type { ReactNode } from "react";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface AudioZoneProps {
  children: ReactNode;
  /** Center position of the audio zone. */
  position: Vector3;
  /** Radius in meters within which audio is heard. */
  radius?: number;
  /** Volume multiplier inside the zone (0-1). */
  volume?: number;
}

/**
 * Defines a region in 3D space where audio effects are applied.
 *
 * Children inside the zone receive spatial audio processing.
 * Audio fades based on distance from the zone center.
 *
 * @example
 * ```tsx
 * <AudioZone position={{ x: 0, y: 0, z: 0 }} radius={5} volume={0.8}>
 *   <SpatialPanel>Content with spatial audio</SpatialPanel>
 * </AudioZone>
 * ```
 */
export function AudioZone({
  children,
  position,
  radius = 5,
  volume = 1,
}: AudioZoneProps) {
  return (
    <div
      data-xr-audio-zone=""
      data-xr-position={`${position.x},${position.y},${position.z}`}
      data-xr-radius={radius}
      data-xr-volume={volume}
    >
      {children}
    </div>
  );
}
