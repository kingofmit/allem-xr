"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpatialAudioConfig, SpatialAudioState, Vector3 } from "../types";

/**
 * Hook for playing audio at a position in 3D space.
 *
 * Uses the Web Audio API with a PannerNode for spatial positioning.
 *
 * @param src - URL of the audio file
 * @param config - Spatial audio configuration
 *
 * @example
 * ```tsx
 * const { play, pause, isPlaying } = useSpatialAudio("/sound.mp3", {
 *   position: { x: 1, y: 0, z: -2 },
 * });
 * ```
 */
export function useSpatialAudio(src: string, config: SpatialAudioConfig = {}): SpatialAudioState {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pannerRef = useRef<PannerNode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioContextRef.current = new AudioContext();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const play = useCallback(() => {
    // In a full implementation, this would load the audio buffer,
    // create a PannerNode at the configured position, and start playback.
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const setPosition = useCallback((position: Vector3) => {
    if (pannerRef.current) {
      pannerRef.current.positionX.value = position.x;
      pannerRef.current.positionY.value = position.y;
      pannerRef.current.positionZ.value = position.z;
    }
  }, []);

  const setVolume = useCallback((_volume: number) => {
    // Adjust gain node volume
  }, []);

  return { play, pause, stop, setPosition, setVolume, isPlaying };
}
