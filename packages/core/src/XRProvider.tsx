"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { XRConfig, XRContextValue, XRMode, XRSessionState } from "./types";

export const XRContext = createContext<XRContextValue | null>(null);

export interface XRProviderProps {
  children: ReactNode;
  config?: XRConfig;
}

/**
 * Provides XR session state to the component tree.
 *
 * Wrap your app (or scene) with `<XRProvider>` to enable XR hooks.
 */
export function XRProvider({ children, config = {} }: XRProviderProps) {
  const [state, setState] = useState<XRSessionState>("idle");
  const [mode, setMode] = useState<XRMode | null>(null);
  const [session, setSession] = useState<XRSession | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.xr) return;

    navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
      setIsSupported(supported);
    });
  }, []);

  const start = useCallback(
    async (requestedMode?: XRMode) => {
      if (typeof navigator === "undefined" || !navigator.xr) return;

      const targetMode = requestedMode ?? config.preferredMode ?? "immersive-ar";

      setState("requesting");
      try {
        const xrSession = await navigator.xr.requestSession(targetMode, {
          requiredFeatures: config.requiredFeatures,
          optionalFeatures: config.optionalFeatures,
        });

        xrSession.addEventListener("end", () => {
          setState("idle");
          setMode(null);
          setSession(null);
        });

        setSession(xrSession);
        setMode(targetMode);
        setState("active");
      } catch {
        setState("error");
      }
    },
    [config],
  );

  const end = useCallback(async () => {
    if (!session) return;
    setState("ending");
    await session.end();
  }, [session]);

  useEffect(() => {
    if (config.autoStart && isSupported) {
      start();
    }
  }, [config.autoStart, isSupported, start]);

  const value = useMemo<XRContextValue>(
    () => ({
      state,
      mode,
      isPresenting: state === "active",
      isSupported,
      session,
      start,
      end,
      config,
    }),
    [state, mode, isSupported, session, start, end, config],
  );

  return <XRContext.Provider value={value}>{children}</XRContext.Provider>;
}
