"use client";

import type { CSSProperties } from "react";
import type { AvatarState } from "../types";

export interface AvatarRendererProps {
  /** Avatar state from useAvatar. */
  avatar: AvatarState;
  /** Whether to show the skeleton debug overlay. */
  showSkeleton?: boolean;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * Renders an avatar model with IK-driven animation.
 *
 * In a full 3D implementation, this would render the GLB model
 * with bone transforms applied from the IK solver.
 *
 * @example
 * ```tsx
 * const avatar = useAvatar({ modelUrl: "/models/avatar.glb" });
 * return <AvatarRenderer avatar={avatar} showSkeleton />;
 * ```
 */
export function AvatarRenderer({
  avatar,
  showSkeleton = false,
  className,
  style,
}: AvatarRendererProps) {
  return (
    <div
      className={className}
      style={style}
      data-xr-avatar=""
      data-xr-model={avatar.config.modelUrl}
      data-xr-loaded={avatar.isLoaded || undefined}
      data-xr-show-skeleton={showSkeleton || undefined}
      data-xr-ik-targets={avatar.ikTargets.length}
    >
      {!avatar.isLoaded && <span>Loading avatar...</span>}
    </div>
  );
}
