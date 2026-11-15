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

/** A spatial anchor persisted in the environment. */
export interface SpatialAnchor {
  id: string;
  position: Vector3;
  orientation: Quaternion;
  createdAt: number;
  /** Whether the anchor is still being tracked. */
  isTracking: boolean;
}

/** Result from a hit test against real-world geometry. */
export interface HitTestResult {
  position: Vector3;
  orientation: Quaternion;
  /** The plane this hit intersected, if any. */
  planeId: string | null;
}

/** A detected real-world plane (floor, wall, table, etc.). */
export interface Plane {
  id: string;
  position: Vector3;
  orientation: Quaternion;
  /** Plane extent in meters [width, height]. */
  extent: [number, number];
  /** Semantic label if available. */
  label: "floor" | "wall" | "ceiling" | "table" | "unknown";
}

/** Reconstructed scene mesh data. */
export interface SceneMesh {
  /** Flat array of vertex positions [x,y,z, x,y,z, ...]. */
  vertices: Float32Array;
  /** Triangle indices. */
  indices: Uint32Array;
  /** Whether the mesh is still being updated. */
  isUpdating: boolean;
}

/** Return type for useSpatialAnchor. */
export interface SpatialAnchorState {
  anchors: SpatialAnchor[];
  createAnchor: (position: Vector3, orientation?: Quaternion) => Promise<SpatialAnchor | null>;
  deleteAnchor: (id: string) => Promise<void>;
}

/** Return type for usePlaneDetection. */
export interface PlaneDetectionState {
  planes: Plane[];
  isDetecting: boolean;
}

/** Return type for useSceneMesh. */
export interface SceneMeshState {
  mesh: SceneMesh | null;
  isReconstructing: boolean;
}
