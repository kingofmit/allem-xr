/** 3D position vector. */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** A single hand joint with position and radius. */
export interface Joint {
  name: string;
  position: Vector3;
  radius: number;
}

/** Hand data with joints and handedness. */
export interface Hand {
  handedness: "left" | "right";
  joints: Joint[];
  visible: boolean;
}

/** Recognized gesture. */
export interface Gesture {
  name: string;
  confidence: number;
  hand: "left" | "right";
}

/** Pinch state for a single hand. */
export interface PinchState {
  isPinching: boolean;
  distance: number;
  position: Vector3 | null;
}

/** Grab state for a single hand. */
export interface GrabState {
  isGrabbing: boolean;
  strength: number;
}

/** Return type for useHands. */
export interface HandsState {
  left: Hand | null;
  right: Hand | null;
}
