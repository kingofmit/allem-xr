"use client";

import { useContext } from "react";
import { XRContext } from "../XRProvider";
import type { XRContextValue } from "../types";

/**
 * Access the current XR session state, mode, and presentation status.
 *
 * Must be used within an `<XRProvider>`.
 *
 * @example
 * ```tsx
 * const { isPresenting, mode, isSupported } = useXR();
 * ```
 */
export function useXR(): XRContextValue {
  const context = useContext(XRContext);
  if (!context) {
    throw new Error("useXR must be used within an <XRProvider>");
  }
  return context;
}
