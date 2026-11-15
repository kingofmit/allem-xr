"use client";

import { useContext, useMemo } from "react";
import { XRContext } from "../XRProvider";
import type { XRMode } from "../types";

export interface UseSessionReturn {
  /** Start an XR session with optional mode override. */
  start: (mode?: XRMode) => Promise<void>;
  /** End the current XR session. */
  end: () => Promise<void>;
  /** Whether a session is currently active. */
  isActive: boolean;
  /** The raw XRSession object, if active. */
  session: XRSession | null;
}

/**
 * Hook for starting and ending XR sessions.
 *
 * @example
 * ```tsx
 * const { start, end, isActive } = useSession();
 * ```
 */
export function useSession(): UseSessionReturn {
  const context = useContext(XRContext);
  if (!context) {
    throw new Error("useSession must be used within an <XRProvider>");
  }

  return useMemo(
    () => ({
      start: context.start,
      end: context.end,
      isActive: context.state === "active",
      session: context.session,
    }),
    [context.start, context.end, context.state, context.session],
  );
}
