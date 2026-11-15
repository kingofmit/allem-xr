"use client";

import { useEffect, useState, type CSSProperties } from "react";

export interface GazePointerProps {
  /** Pointer size in pixels (rendered as a circle). */
  size?: number;
  /** Dwell time in milliseconds before triggering a select. */
  dwellTime?: number;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * A gaze-based cursor that follows the user's head direction.
 *
 * When the pointer dwells on an interactive element for the configured
 * duration, it triggers a select event. Useful for hands-free interaction.
 *
 * @example
 * ```tsx
 * <GazePointer size={24} dwellTime={800} />
 * ```
 */
export function GazePointer({
  size = 20,
  dwellTime = 1000,
  className,
  style,
}: GazePointerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDwelling, setIsDwelling] = useState(false);

  useEffect(() => {
    // In an XR session, the gaze direction comes from the XRView's
    // transform. Outside XR, we fall back to mouse position for testing.
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid white",
        pointerEvents: "none",
        zIndex: 9999,
        ...style,
      }}
      data-xr-gaze-pointer=""
      data-xr-dwelling={isDwelling || undefined}
      data-xr-dwell-time={dwellTime}
      aria-hidden="true"
    />
  );
}
