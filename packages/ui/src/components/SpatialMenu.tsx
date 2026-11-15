"use client";

import { type CSSProperties, type ReactNode } from "react";

export interface SpatialMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
}

export interface SpatialMenuProps {
  items: SpatialMenuItem[];
  /** Menu layout mode. */
  layout?: "radial" | "grid" | "list";
  /** Whether the menu is visible. */
  visible?: boolean;
  /** Custom CSS class. */
  className?: string;
  /** Custom inline styles. */
  style?: CSSProperties;
}

/**
 * A spatial menu that displays items in a radial, grid, or list layout.
 *
 * @example
 * ```tsx
 * <SpatialMenu
 *   layout="radial"
 *   items={[
 *     { id: "1", label: "Edit", onSelect: () => {} },
 *     { id: "2", label: "Delete", onSelect: () => {} },
 *   ]}
 * />
 * ```
 */
export function SpatialMenu({
  items,
  layout = "list",
  visible = true,
  className,
  style,
}: SpatialMenuProps) {
  if (!visible) return null;

  return (
    <nav
      className={className}
      style={style}
      data-xr-menu=""
      data-xr-layout={layout}
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onSelect}
          role="menuitem"
          data-xr-menu-item=""
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
