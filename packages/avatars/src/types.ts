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

/** A bone in the avatar skeleton. */
export interface Bone {
  name: string;
  position: Vector3;
  rotation: Quaternion;
  parent: string | null;
  children: string[];
}

/** Avatar skeleton definition. */
export interface Skeleton {
  bones: Bone[];
  rootBone: string;
}

/** IK (Inverse Kinematics) target. */
export interface IKTarget {
  /** Which body part this target drives. */
  effector: "head" | "leftHand" | "rightHand" | "leftFoot" | "rightFoot" | "hips";
  /** Target position. */
  position: Vector3;
  /** Target rotation. */
  rotation?: Quaternion;
  /** Weight of this IK constraint (0-1). */
  weight?: number;
}

/** Avatar configuration. */
export interface AvatarConfig {
  /** URL of the 3D model (GLB/GLTF). */
  modelUrl?: string;
  /** Initial skeleton pose. */
  skeleton?: Skeleton;
  /** Scale multiplier. */
  scale?: number;
}

/** Avatar state returned by useAvatar. */
export interface AvatarState {
  /** Whether the avatar model is loaded. */
  isLoaded: boolean;
  /** The avatar skeleton. */
  skeleton: Skeleton | null;
  /** Current IK targets. */
  ikTargets: IKTarget[];
  /** Update an IK target. */
  setIKTarget: (target: IKTarget) => void;
  /** Configuration. */
  config: AvatarConfig;
}

/** IK solver state returned by useIK. */
export interface IKState {
  /** Whether the IK solver is active. */
  isActive: boolean;
  /** Set IK targets for the solver. */
  setTargets: (targets: IKTarget[]) => void;
  /** Current solved bone transforms. */
  solvedBones: Bone[];
}
