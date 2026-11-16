# @allem-xr/physics

Physics simulation with Rapier -- rigid bodies, real-world colliders, and hand-driven physics for Allem XR.

## Installation

```bash
npm install @allem-xr/physics @allem-xr/core @allem-xr/spatial @react-three/fiber three
```

Rapier WASM is loaded automatically at runtime.

## Quick Start

```tsx
import { PhysicsWorld, RigidBody, RealWorldCollider, useCollision } from '@allem-xr/physics'

function PhysicsScene() {
  useCollision((event) => {
    console.log('Hit:', event.other, 'impulse:', event.impulse)
  })

  return (
    <PhysicsWorld gravity={[0, -9.81, 0]}>
      <RealWorldCollider source="planes" />
      <RigidBody type="dynamic" mass={0.5} position={[0, 2, -1]}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="tomato" />
        </mesh>
      </RigidBody>
    </PhysicsWorld>
  )
}
```

## Components

### `<PhysicsWorld>`

Top-level physics simulation container. Uses Rapier3D under the hood.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gravity` | `[x, y, z]` | `[0, -9.81, 0]` | Gravity vector |
| `timestep` | `number` | `1/72` | Fixed timestep (tuned for Quest refresh rate) |
| `ccd` | `boolean` | -- | Enable continuous collision detection |

### `<RigidBody>`

Wraps a Three.js mesh with a physics rigid body and collider.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'dynamic' \| 'fixed' \| 'kinematic-position' \| 'kinematic-velocity'` | `'dynamic'` | Body type |
| `mass` | `number` | `1` | Mass in kg (dynamic only) |
| `position` | `[x, y, z]` | -- | Initial position |
| `rotation` | `[x, y, z]` | -- | Initial rotation (euler) |
| `collider` | `'cuboid' \| 'ball' \| 'capsule' \| 'trimesh' \| 'convex-hull' \| 'auto'` | `'auto'` | Collider shape (`auto` infers from geometry) |
| `args` | `number[]` | -- | Collider size args (cuboid: `[hx,hy,hz]`, ball: `[radius]`) |
| `restitution` | `number` | `0.3` | Bounciness 0-1 |
| `friction` | `number` | `0.7` | Friction coefficient 0-1 |
| `linearDamping` | `number` | `0.05` | Linear damping |
| `angularDamping` | `number` | `0.05` | Angular damping |
| `ccd` | `boolean` | -- | Enable CCD for this body |
| `onCollision` | `(event: CollisionEvent) => void` | -- | Collision callback |
| `name` | `string` | -- | Body name for collision identification |

`CollisionEvent`: `{ other: string, contactPoint: Vector3, normal: Vector3, impulse: number }`

### `<RealWorldCollider>`

Creates physics colliders from detected real-world planes. Requires `@allem-xr/spatial` plane detection.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `'planes'` | required | Real-world geometry source |
| `friction` | `number` | `0.8` | Surface friction |
| `restitution` | `number` | `0.2` | Surface bounciness |

## Hooks

### `useCollision(callback)`

Global collision event listener.

```tsx
useCollision((event) => {
  console.log(event.other, event.contactPoint, event.impulse)
})
```

### `useHandPhysics()`

Drive physics objects with hand tracking. Hands become kinematic bodies that push dynamic objects.

```tsx
useHandPhysics()
```

### `useGravity()`

Read and control gravity at runtime.

```tsx
const { gravity, setGravity } = useGravity()
setGravity([0, -4.9, 0]) // moon gravity
```

### `usePhysicsContext()`

Access the Rapier world instance and body registry directly.

## License

MIT
