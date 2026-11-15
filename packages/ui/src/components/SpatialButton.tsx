"use client";

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";

export interface SpatialButtonProps {
  children: ReactNode;
  /** Called when the button is selected via gaze, pinch, or click. */
  onSelect?: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * An interactive button that responds to gaze, pinch, and pointer input.
 *
 * Provides visual feedback for hover (gaze dwell) and active (pinch/click) states.
 *
 * @example
 * ```tsx
 * <SpatialButton onSelect={() => console.log("Selected!")}>
 *   Confirm
 * </SpatialButton>
 * ```
 */
export function SpatialButton({
  children,
  onSelect,
  disabled = false,
  className,
  style,
}: SpatialButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleSelect = useCallback(() => {
    if (!disabled && onSelect) {
      onSelect();
    }
  }, [disabled, onSelect]);

  return (
    <button
      className={className}
      style={style}
      disabled={disabled}
      onClick={handleSelect}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => setIsActive(false)}
      data-xr-button=""
      data-xr-hovered={isHovered || undefined}
      data-xr-active={isActive || undefined}
      role="button"
    >
      {children}
    </button>
  );
}
