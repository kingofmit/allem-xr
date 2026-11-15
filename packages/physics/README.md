# @allem-xr/physics

Physics world, rigid bodies, collisions, and gravity for React XR.

## Installation

```bash
npm install @allem-xr/physics @allem-xr/core
```

## Usage

```tsx
import { usePhysicsWorld, RigidBody, useCollision } from "@allem-xr/physics";

function PhysicsScene() {
  const world = usePhysicsWorld({ gravity: { x: 0, y: -9.81, z: 0 } });

  useCollision((event) => {
    console.log("Collision:", event.bodyA, event.bodyB);
  });

  return (
    <RigidBody type="dynamic" mass={1} position={{ x: 0, y: 2, z: 0 }}>
      <mesh />
    </RigidBody>
  );
}
```

## License

[MIT](../../LICENSE)
