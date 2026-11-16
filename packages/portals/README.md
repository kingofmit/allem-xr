# @allem-xr/portals

Portals, scene transitions, guardian boundaries, and passthrough windows for Allem XR.

## Installation

```bash
npm install @allem-xr/portals @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { Portal, Guardian, SceneTransition, useSceneTransition } from '@allem-xr/portals'

function PortalScene() {
  const { transition, isTransitioning } = useSceneTransition()

  return (
    <>
      <Portal position={[0, 0, -2]} size={[1.5, 2]} onEnter={() => transition({ effect: 'iris' })}>
        <VirtualRoom />
      </Portal>
      <Guardian radius={3} color="#ff4444" onBreach={() => console.log('Too far!')} />
      <SceneTransition active={isTransitioning} effect="fade" duration={500} />
    </>
  )
}
```

## Components

### `<Portal>`

Renders a window into another scene. Children are rendered inside the portal.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[x, y, z]` | -- | Portal position |
| `rotation` | `[x, y, z]` | -- | Portal rotation |
| `size` | `[width, height]` | -- | Portal dimensions in meters |
| `onEnter` | `() => void` | -- | Called when user enters the portal |
| `onExit` | `() => void` | -- | Called when user exits |
| `renderBorder` | `boolean` | -- | Show a visible border |
| `borderColor` | `string` | -- | Border color |
| `borderWidth` | `number` | -- | Border width |

### `<SceneTransition>`

Full-screen transition overlay (fade, dissolve, iris).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | required | Whether transition is playing |
| `duration` | `number` | -- | Duration in ms |
| `effect` | `'fade' \| 'dissolve' \| 'iris'` | -- | Transition effect |
| `color` | `string` | -- | Fade/effect color |
| `onComplete` | `() => void` | -- | Called when transition finishes |

### `<Guardian>`

Safety boundary that becomes visible as the user approaches the edge.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `radius` | `number` | -- | Boundary radius in meters |
| `color` | `string` | -- | Guardian color |
| `opacity` | `number` | -- | Max opacity |
| `fadeDistance` | `number` | -- | Distance at which guardian starts appearing |
| `segments` | `number` | -- | Circle segments |
| `height` | `number` | -- | Guardian wall height |
| `onBreach` | `() => void` | -- | Called when boundary is breached |
| `visible` | `boolean` | -- | Force visibility |

### `<PassthroughWindow>`

Creates a window showing the real world (passthrough) inside a VR scene.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[x, y, z]` | -- | Window position |
| `size` | `[width, height]` | -- | Window dimensions |
| `shape` | `'rectangle' \| 'circle'` | -- | Window shape |

## Hooks

### `useSceneTransition()`

Programmatic scene transition control.

```tsx
const { transition, isTransitioning } = useSceneTransition()
await transition({ duration: 800, effect: 'dissolve', fadeColor: '#000' })
```

Returns `SceneTransitionState`:

| Field | Type | Description |
|-------|------|-------------|
| `transition` | `(config?: TransitionConfig) => Promise<void>` | Trigger a transition |
| `isTransitioning` | `boolean` | Whether a transition is in progress |

`TransitionConfig`: `{ duration?: number, effect?: 'fade' | 'dissolve' | 'iris', fadeColor?: string }`

### `useGuardian(radius?, fadeDistance?)`

Track user proximity to the guardian boundary.

```tsx
const { isNearBoundary, distanceToBoundary } = useGuardian(3, 0.5)
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `radius` | `number` | `2` | Boundary radius |
| `fadeDistance` | `number` | `0.5` | Fade-in distance |

Returns `GuardianState`: `{ isNearBoundary: boolean, distanceToBoundary: number }`.

### `usePassthrough()`

Track passthrough availability and enabled state.

```tsx
const { isAvailable, isEnabled, enable, disable } = usePassthrough()
```

Returns `PassthroughState`:

| Field | Type | Description |
|-------|------|-------------|
| `isAvailable` | `boolean` | Whether device supports passthrough |
| `isEnabled` | `boolean` | Current enabled state |
| `enable` | `() => void` | Enable passthrough |
| `disable` | `() => void` | Disable passthrough |

## License

MIT
