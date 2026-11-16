# @allem-xr/core

Session management, input abstraction, and capability detection for Allem XR.

## Installation

```bash
npm install @allem-xr/core @react-three/fiber three react
```

## Quick Start

```tsx
import { XRProvider, XRScene, XROrigin, useXR } from '@allem-xr/core'
import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <XRProvider mode="immersive-ar" features={['hand-tracking', 'hit-test']}>
      <Canvas>
        <XRScene>
          <XROrigin />
          <YourScene />
        </XRScene>
      </Canvas>
    </XRProvider>
  )
}
```

## Components

### `<XRProvider>`

Top-level provider. Wraps your entire app (above Canvas).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'immersive-vr' \| 'immersive-ar' \| 'inline'` | `'immersive-ar'` | Preferred XR mode |
| `features` | `(string \| { name: string; required: boolean })[]` | `[]` | WebXR features to request |
| `referenceSpace` | `XRReferenceSpaceType` | `'local-floor'` | Reference space type |
| `foveation` | `number` | -- | Foveation level 0-1 |
| `frameBufferScaling` | `number` | -- | Framebuffer scale factor |
| `fallback` | `ReactNode` | -- | Rendered when WebXR unavailable |
| `onSessionStart` | `(session: XRSession) => void` | -- | Called when session starts |
| `onSessionEnd` | `() => void` | -- | Called when session ends |
| `onError` | `(error: Error) => void` | -- | Called on error |

### `<XRScene>`

Goes inside `<Canvas>`. Bridges the XR session to the Three.js renderer.

### `<XROrigin>`

Represents the user's feet position. Move this to teleport the user.

| Prop | Type | Default |
|------|------|---------|
| `position` | `[x, y, z]` | `[0, 0, 0]` |
| `rotation` | `[x, y, z]` | `[0, 0, 0]` |

## Hooks

### `useXR()`

Returns XR session state and actions.

```tsx
const { session, isPresenting, isAR, isVR, mode, start, end } = useXR()
```

| Field | Type | Description |
|-------|------|-------------|
| `session` | `XRSession \| null` | Current session |
| `sessionState` | `'idle' \| 'requesting' \| 'active' \| 'ending' \| 'error'` | State machine |
| `isPresenting` | `boolean` | Whether currently presenting |
| `isAR` / `isVR` | `boolean` | Mode checks |
| `mode` | `XRMode` | Active mode |
| `referenceSpace` | `XRReferenceSpace \| null` | Active reference space |
| `inputSources` | `XRInputAbstraction[]` | Abstracted input sources |
| `start(mode?)` | `(mode?: XRMode) => Promise<void>` | Start session |
| `end()` | `() => Promise<void>` | End session |

### `useXRSession()`

Convenience hook for session lifecycle.

```tsx
const { start, end, isActive, session, state } = useXRSession()
```

### `useXRSupport()`

Detect WebXR support. Works outside `<XRProvider>`.

```tsx
const { vr, ar, inline, isWebXRAvailable, isLoading } = useXRSupport()
```

| Field | Type | Description |
|-------|------|-------------|
| `isWebXRAvailable` | `boolean` | Whether WebXR API exists |
| `vr` | `boolean` | `immersive-vr` supported |
| `ar` | `boolean` | `immersive-ar` supported |
| `inline` | `boolean` | `inline` supported |
| `isLoading` | `boolean` | Still checking |
| `featureSupport` | `Map<string, boolean>` | Per-feature results |

### `useXRInput(options?)`

Access abstracted XR input sources. Filter by type and handedness.

```tsx
const hands = useXRInput({ type: 'hand' })
const rightController = useXRInput({ type: 'controller', handedness: 'right' })
```

Each `XRInputAbstraction` contains: `id`, `type`, `handedness`, `raw`, `targetRaySpace`, `gripSpace`, `gamepad`, `hand`, `selecting`, `squeezing`.

### `useXREvent(event, handler, options?)`

Listen to XR session events with optional handedness filter.

```tsx
useXREvent('select', (e) => console.log('selected!'), { handedness: 'right' })
```

### `useXRFrame(callback)`

Register a callback that runs every XR frame.

```tsx
useXRFrame((frame, delta, referenceSpace) => {
  const pose = frame.getViewerPose(referenceSpace)
})
```

## Advanced

### `useXRContext()`

Access the full `XRContextValue` (used by other Allem XR packages).

### Exported types

`XRMode`, `XRSessionState`, `XRInputType`, `XRHandedness`, `XRFeatureDescriptor`, `XRProviderConfig`, `XRInputAbstraction`, `XRState`, `XRActions`, `XRContextValue`, `XRSupport`, `XREventOptions`

## License

MIT
