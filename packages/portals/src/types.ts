/** 3D position vector. */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Quaternion rotation. */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** Portal size in meters. */
export interface PortalSize {
  width: number;
  height: number;
}

/** Scene transition configuration. */
export interface TransitionConfig {
  /** Transition duration in milliseconds. */
  duration?: number;
  /** Transition easing. */
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  /** Fade color during transition. */
  fadeColor?: string;
}

/** Return type for usePortalTransition. */
export interface PortalTransitionState {
  /** Transition to a named scene. */
  transition: (sceneName: string, config?: TransitionConfig) => Promise<void>;
  /** Whether a transition is in progress. */
  isTransitioning: boolean;
  /** Name of the current scene. */
  currentScene: string;
}
