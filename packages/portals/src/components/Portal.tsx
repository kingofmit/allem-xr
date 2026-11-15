"use client";

import type { ReactNode } from "react";
import type { PortalSize, Quaternion, Vector3 } from "../types";

export interface PortalProps {
  children: ReactNode;
  /** Position of the portal in 3D space. */
  position: Vector3;
  /** Rotation of the portal. */
  rotation?: Quaternion;
  /** Size of the portal opening. */
  size?: PortalSize;
  /** Called when the user steps through the portal. */
  onEnter?: () => void;
  /** Called when the user steps back out. */
  onExit?: () => void;
  /** Whether to show the portal frame/border. */
  showFrame?: boolean;
}

/**
 * An AR passthrough portal that reveals a virtual scene behind it.
 *
 * When the user walks through the portal, the virtual content
 * replaces the passthrough view. Walking back exits the portal.
 *
 * @example
 * ```tsx
 * <Portal position={{ x: 0, y: 0, z: -2 }} size={{ width: 1.5, height: 2 }}>
 *   <VirtualRoom />
 * </Portal>
 * ```
 */
export function Portal({
  children,
  position,
  rotation,
  size = { width: 1, height: 2 },
  onEnter,
  onExit,
  showFrame = true,
}: PortalProps) {
  return (
    <div
      data-xr-portal=""
      data-xr-position={`${position.x},${position.y},${position.z}`}
      data-xr-rotation={
        rotation ? `${rotation.x},${rotation.y},${rotation.z},${rotation.w}` : undefined
      }
      data-xr-size={`${size.width},${size.height}`}
      data-xr-show-frame={showFrame || undefined}
    >
      {children}
    </div>
  );
}
