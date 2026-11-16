# @allem-xr/spatial

Hit testing, plane detection, anchors, scene mesh, depth, and light estimation for Allem XR.

## Installation

```bash
npm install @allem-xr/spatial @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { XRProvider } from '@allem-xr/core'
import { useHitTest, usePlanes, SurfacePlacer, PlaneOverlay } from '@allem-xr/spatial'

function PlaceObjects() {
  return (
    <SurfacePlacer onPlace={(pos, rot) => console.log('Placed at', pos)}>
      <mesh><sphereGeometry args={[0.05]} /></mesh>
    </SurfacePlacer>
  )
}

// Wrap with features enabled:
<XRProvider features={['hit-test', 'plane-detection', 'anchors']}>
```

## Hooks

### `useHitTest(options?)`

Perform hit testing against real-world geometry. Requires `'hit-test'` feature.

```tsx
const { supported, results } = useHitTest({ source: 'viewer' })
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `'viewer' \| 'controller-left' \| 'controller-right' \| 'hand-left' \| 'hand-right'` | `'viewer'` | Ray source |
| `offsetRay` | `{ origin, direction }` | -- | Custom ray |

Returns `HitTestState`: `{ supported, results: HitTestResult[] }` where each result has `position: Vector3` and `rotation: Quaternion`.

### `usePlanes(options?)`

Detect real-world planes. Requires `'plane-detection'` feature.

```tsx
const { supported, planes, isDetecting } = usePlanes({ filter: 'horizontal' })
```

| Option | Type | Default |
|--------|------|---------|
| `filter` | `'horizontal' \| 'vertical' \| 'all'` | `'all'` |

Each `DetectedPlane` contains: `id`, `position`, `rotation`, `polygon`, `label` (`'floor'|'wall'|'ceiling'|'table'|'door'|'window'|'unknown'`), `extent`, `raw`.

### `useAnchor()`

Create, persist, and restore spatial anchors. Requires `'anchors'` feature.

```tsx
const { supported, anchors, create, delete: del, persist, restore } = useAnchor()
const anchor = await create(position, rotation)
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `create` | `(position, rotation) => Promise<Anchor \| null>` | Create an anchor |
| `delete` | `(id: string) => Promise<void>` | Delete an anchor |
| `persist` | `(id: string) => Promise<string \| null>` | Persist anchor across sessions |
| `restore` | `() => Promise<Anchor[]>` | Restore persisted anchors |

### `useSceneMesh()`

Access reconstructed scene mesh geometry. Requires `'mesh-detection'` feature.

```tsx
const { supported, meshes, isReconstructing } = useSceneMesh()
```

Each `SceneMeshData` has: `id`, `vertices`, `indices`, `normals`, `geometry` (BufferGeometry), `raw`.

### `useDepth(options?)`

Access depth sensing data. Requires `'depth-sensing'` feature.

```tsx
const { supported, getDepthAt, depthInfo } = useDepth({ usage: 'cpu-optimized' })
const depth = getDepthAt(0.5, 0.5) // center of viewport, in meters
```

| Option | Type | Default |
|--------|------|---------|
| `usage` | `'cpu-optimized' \| 'gpu-optimized'` | -- |
| `dataFormat` | `'luminance-alpha' \| 'float32'` | -- |

### `useLightEstimate()`

Get real-world lighting data for realistic rendering. Requires `'light-estimation'` feature.

```tsx
const { supported, primaryDirection, primaryIntensity, sphericalHarmonics } = useLightEstimate()
```

## Components

### `<PlaneOverlay>`

Renders visual overlays on detected planes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filter` | `'horizontal' \| 'vertical' \| 'all'` | `'all'` | Which planes to show |
| `color` | `string` | -- | Overlay color |
| `opacity` | `number` | -- | Overlay opacity |
| `showLabels` | `boolean` | -- | Show semantic labels |

### `<SurfacePlacer>`

Hit-test-based object placement with a visual indicator.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPlace` | `(position: Vector3, rotation: Quaternion) => void` | required | Placement callback |
| `active` | `boolean` | `true` | Whether placement is active |
| `children` | `ReactNode` | -- | Visual indicator at hit point |

### `<SceneMeshOccluder>`

Renders the scene mesh as an invisible occluder for realistic object hiding behind real-world surfaces.

## License

MIT
