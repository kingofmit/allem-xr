/** 3D position vector. */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Configuration for spatial audio playback. */
export interface SpatialAudioConfig {
  /** Position of the audio source in 3D space. */
  position?: Vector3;
  /** Maximum distance at which the sound is audible (meters). */
  maxDistance?: number;
  /** Rolloff factor for distance attenuation. */
  rolloffFactor?: number;
  /** Whether to loop the audio. */
  loop?: boolean;
  /** Initial volume (0-1). */
  volume?: number;
}

/** Return type for useSpatialAudio. */
export interface SpatialAudioState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setPosition: (position: Vector3) => void;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
}

/** Return type for useHRTF. */
export interface HRTFState {
  /** Whether HRTF is available and active. */
  isActive: boolean;
  /** Set the listener position (usually the camera/head). */
  setListenerPosition: (position: Vector3) => void;
  /** Set the listener orientation. */
  setListenerOrientation: (forward: Vector3, up: Vector3) => void;
}
