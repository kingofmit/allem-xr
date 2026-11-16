# @allem-xr/avatars

Avatar loading, XR-driven IK tracking, and mirror rendering for Allem XR.

## Installation

```bash
npm install @allem-xr/avatars @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { Avatar, AvatarMirror } from '@allem-xr/avatars'

function AvatarScene() {
  return (
    <>
      <Avatar model="/models/avatar.glb" trackHead trackHands estimateBody />
      <AvatarMirror position={[0, 1, -2]} width={1} height={2} />
    </>
  )
}
```

## Hooks

### `useAvatar(config)`

Load a GLB/VRM avatar model and manage IK targets.

```tsx
const { isLoaded, scene, setIKTarget, bones } = useAvatar({
  modelUrl: '/models/avatar.glb',
  scale: 1,
  ikEnabled: true,
})
```

| Config | Type | Default | Description |
|--------|------|---------|-------------|
| `modelUrl` | `string` | required | URL to GLB/VRM model |
| `scale` | `number` | `1` | Model scale |
| `ikEnabled` | `boolean` | `true` | Enable IK solving |

Returns `AvatarState`:

| Field | Type | Description |
|-------|------|-------------|
| `isLoaded` | `boolean` | Whether the model is loaded |
| `scene` | `Group \| null` | Three.js group containing the model |
| `setIKTarget` | `(effector, position, rotation?) => void` | Set an IK target |
| `bones` | `Map<string, Object3D>` | Named bone references |

IK effectors: `'head'`, `'leftHand'`, `'rightHand'`, `'hips'`, `'leftFoot'`, `'rightFoot'`.

### `useAvatarTracking(avatar, options?)`

Automatically drives avatar IK targets from XR tracking data (headset and hand positions).

```tsx
const avatar = useAvatar({ modelUrl: '/models/avatar.glb' })
useAvatarTracking(avatar, { head: true, hands: true, estimateBody: true })
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `head` | `boolean` | -- | Track head from headset pose |
| `hands` | `boolean` | -- | Track hands from hand/controller input |
| `estimateBody` | `boolean` | -- | Estimate hip position from head/hands |

### `useIK(chains?)`

Low-level FABRIK IK solver. Pre-allocates all vectors for zero-GC frame loops.

```tsx
const { isActive, setTarget, solvedBones } = useIK([
  { name: 'rightArm', boneNames: ['shoulder', 'elbow', 'wrist'], target: { effector: 'rightHand', position: pos } }
])
```

Returns `IKState`:

| Field | Type | Description |
|-------|------|-------------|
| `isActive` | `boolean` | Whether the solver is running |
| `setTarget` | `(effector, position, rotation?) => void` | Update an IK target |
| `solvedBones` | `Map<string, { position, rotation }>` | Solved bone transforms |

## Components

### `<Avatar>`

All-in-one avatar component with built-in tracking.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `model` | `string` | required | URL to GLB/VRM model |
| `trackHead` | `boolean` | -- | Track head from headset |
| `trackHands` | `boolean` | -- | Track hands |
| `estimateBody` | `boolean` | -- | Estimate body pose |
| `scale` | `number` | -- | Model scale |
| `castShadow` | `boolean` | -- | Cast shadows |
| `position` | `[x, y, z]` | -- | Position offset |

### `<AvatarMirror>`

Renders a mirror surface that reflects the avatar in real time.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[x, y, z]` | -- | Mirror position |
| `width` | `number` | -- | Mirror width in meters |
| `height` | `number` | -- | Mirror height in meters |
| `resolution` | `number` | -- | Render resolution |

## License

MIT
