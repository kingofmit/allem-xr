import type { Vector3, Quaternion, BufferGeometry, Mesh } from 'three'

export interface HitTestResult {
  position: Vector3
  rotation: Quaternion
}

export interface HitTestOptions {
  /** Source of the ray */
  source?: 'viewer' | 'controller-left' | 'controller-right' | 'hand-left' | 'hand-right'
  /** Custom offset ray */
  offsetRay?: { origin: DOMPointInit; direction: DOMPointInit }
}

export interface HitTestState {
  /** Whether hit-test feature is supported and active */
  supported: boolean
  /** Most recent hit test results this frame */
  results: HitTestResult[]
}

export type PlaneLabel = 'floor' | 'wall' | 'ceiling' | 'table' | 'door' | 'window' | 'unknown'

export interface DetectedPlane {
  /** Stable identifier */
  id: string
  /** Center position */
  position: Vector3
  /** Orientation */
  rotation: Quaternion
  /** Boundary polygon vertices (in plane-local coordinates) */
  polygon: Vector3[]
  /** Semantic label if available */
  label: PlaneLabel
  /** Bounding extent [width, height] in meters */
  extent: [number, number]
  /** Raw XRPlane reference */
  raw: XRPlane
}

export type PlaneFilter = 'horizontal' | 'vertical' | 'all'

export interface PlaneDetectionState {
  supported: boolean
  planes: DetectedPlane[]
  isDetecting: boolean
}

export interface PlaneDetectionOptions {
  filter?: PlaneFilter
}

export interface Anchor {
  id: string
  position: Vector3
  rotation: Quaternion
  isTracking: boolean
  isPersistent: boolean
  /** Raw XRAnchor reference */
  raw: XRAnchor
}

export interface AnchorState {
  supported: boolean
  anchors: Anchor[]
  create: (position: Vector3, rotation: Quaternion) => Promise<Anchor | null>
  delete: (id: string) => Promise<void>
  persist: (id: string) => Promise<string | null>
  restore: () => Promise<Anchor[]>
}

export interface SceneMeshData {
  id: string
  vertices: Float32Array
  indices: Uint32Array
  normals: Float32Array | null
  geometry: BufferGeometry
  raw: XRMesh
}

export interface SceneMeshState {
  supported: boolean
  meshes: SceneMeshData[]
  isReconstructing: boolean
}

export interface DepthState {
  supported: boolean
  /** Get depth at normalized viewport coordinates (0-1) */
  getDepthAt: (x: number, y: number) => number | null
  /** Raw depth info for GPU use */
  depthInfo: XRCPUDepthInformation | null
}

export interface DepthOptions {
  usage?: 'cpu-optimized' | 'gpu-optimized'
  dataFormat?: 'luminance-alpha' | 'float32'
}

export interface LightEstimateState {
  supported: boolean
  primaryDirection: Vector3
  primaryIntensity: number
  sphericalHarmonics: Float32Array | null
}

export interface PlaneOverlayProps {
  filter?: PlaneFilter
  color?: string
  opacity?: number
  showLabels?: boolean
  children?: React.ReactNode
}

export interface SurfacePlacerProps {
  onPlace: (position: Vector3, rotation: Quaternion) => void
  /** Visual indicator to show at hit test position */
  children?: React.ReactNode
  /** Whether placement is active (default true) */
  active?: boolean
}
