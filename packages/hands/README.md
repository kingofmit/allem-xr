# @allem-xr/hands

Hand tracking, gesture recognition, and pinch/grab interaction for Allem XR.

## Installation

```bash
npm install @allem-xr/hands @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { useHands, useGesture, HandModel } from '@allem-xr/hands'

function HandScene() {
  const { left, right } = useHands()
  const pinch = useGesture('pinch', { hand: 'right' })

  return (
    <>
      <HandModel hand="left" model="spheres" />
      <HandModel hand="right" model="spheres" />
      {pinch.active && <mesh position={pinch.position!.toArray()}>
        <sphereGeometry args={[0.02]} />
      </mesh>}
    </>
  )
}
```

## Hooks

### `useHands()`

Returns real-time hand tracking state for both hands.

```tsx
const { left, right } = useHands()
// left/right: HandState | null
```

`HandState`:

| Field | Type | Description |
|-------|------|-------------|
| `visible` | `boolean` | Whether the hand is tracked |
| `joints` | `Map<XRHandJointName, JointState>` | All 25 joint positions, rotations, radii |
| `raw` | `XRHand \| null` | Raw WebXR hand object |

Also exports `JOINT_NAMES` -- an array of all 25 joint name strings.

### `useGesture(gesture, options?)`

Detect built-in gestures.

```tsx
const pinch = useGesture('pinch', { hand: 'right', threshold: 0.02 })
```

| Param | Type | Description |
|-------|------|-------------|
| `gesture` | `'pinch' \| 'grab' \| 'point' \| 'fist' \| 'open-palm'` | Gesture to detect |
| `options.hand` | `'left' \| 'right'` | Which hand |
| `options.threshold` | `number` | Activation threshold |

Returns `GestureState`:

| Field | Type | Description |
|-------|------|-------------|
| `active` | `boolean` | Whether the gesture is active |
| `confidence` | `number` | 0-1 confidence |
| `position` | `Vector3 \| null` | Gesture position (pinch point, point origin) |
| `value` | `number` | Pinch distance or grip strength |

### `useCustomGesture(config, hand?)`

Register a custom gesture detector that runs every frame.

```tsx
const thumbsUp = useCustomGesture({
  name: 'thumbs-up',
  detect: (joints) => {
    const thumbTip = joints.get('thumb-tip')!
    const indexTip = joints.get('index-finger-tip')!
    const active = thumbTip.position.y > indexTip.position.y + 0.05
    return { active, confidence: active ? 1 : 0 }
  }
}, 'right')
```

| Param | Type | Description |
|-------|------|-------------|
| `config.name` | `string` | Gesture name |
| `config.detect` | `(joints) => { active, confidence, data? }` | Detection function |
| `hand` | `'left' \| 'right'` | Default: `'right'` |

Returns `CustomGestureResult`: `{ active, confidence, data }`.

### `usePinchInteraction(options)`

High-level pinch start/move/end callbacks.

```tsx
usePinchInteraction({
  onPinchStart: (hand, position) => { /* pick up object */ },
  onPinchMove: (hand, position, delta) => { /* drag */ },
  onPinchEnd: (hand) => { /* release */ },
})
```

### `useGrabInteraction(options)`

High-level grab start/move/release callbacks.

```tsx
useGrabInteraction({
  onGrab: (hand, position) => {},
  onMove: (hand, position, velocity) => {},
  onRelease: (hand, velocity) => {},
  threshold: 0.7,
  grabDistance: 0.1,
})
```

## Components

### `<HandModel>`

Renders a visual hand mesh driven by tracking data.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hand` | `'left' \| 'right'` | required | Which hand |
| `model` | `'skeleton' \| 'abstract' \| 'spheres'` | -- | Visual style |
| `color` | `string` | -- | Color |
| `opacity` | `number` | -- | Opacity |
| `jointSize` | `number` | -- | Joint sphere size |
| `boneWidth` | `number` | -- | Bone line width |

### `<HandRay>`

Renders a ray from the hand for pointing interactions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hand` | `'left' \| 'right'` | required | Which hand |
| `color` | `string` | -- | Ray color |
| `maxLength` | `number` | -- | Max ray length |
| `opacity` | `number` | -- | Ray opacity |
| `visible` | `boolean` | -- | Visibility |

## License

MIT
