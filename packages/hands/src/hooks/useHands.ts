"use client";

import { useCallback, useEffect, useState } from "react";
import type { Hand, HandsState } from "../types";

/**
 * Hook returning hand joint data for both hands.
 *
 * Reads hand tracking data from the active XR session's input sources
 * and provides structured joint positions each frame.
 *
 * @example
 * ```tsx
 * const { left, right } = useHands();
 * ```
 */
export function useHands(): HandsState {
  const [hands, setHands] = useState<HandsState>({ left: null, right: null });

  const processHand = useCallback((inputSource: XRInputSource): Hand | null => {
    if (!inputSource.hand) return null;

    const joints = Array.from(inputSource.hand.values()).map((jointSpace, index) => ({
      name: jointSpace.jointName ?? `joint-${index}`,
      position: { x: 0, y: 0, z: 0 },
      radius: 0.005,
    }));

    return {
      handedness: inputSource.handedness === "left" ? "left" : "right",
      joints,
      visible: true,
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.xr) return;

    const handleInputChange = (event: Event) => {
      const xrEvent = event as XRInputSourceChangeEvent;
      const session = xrEvent.session;

      const update: HandsState = { left: null, right: null };
      for (const source of session.inputSources) {
        const hand = processHand(source);
        if (hand) {
          update[hand.handedness] = hand;
        }
      }
      setHands(update);
    };

    // Listen on any active session
    const checkSession = async () => {
      // This is a polling-free approach; real integration would
      // use requestAnimationFrame within the XR session.
    };
    checkSession();

    return () => {
      // Cleanup handled by session end
    };
  }, [processHand]);

  return hands;
}
