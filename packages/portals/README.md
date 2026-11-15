# @allem-xr/portals

AR passthrough portals, scene transitions, and boundaries for React XR.

## Installation

```bash
npm install @allem-xr/portals @allem-xr/core
```

## Usage

```tsx
import { Portal, SceneBoundary, usePortalTransition } from "@allem-xr/portals";

function PortalScene() {
  const { transition, isTransitioning } = usePortalTransition();

  return (
    <>
      <Portal
        position={{ x: 0, y: 0, z: -2 }}
        size={{ width: 1.5, height: 2 }}
        onEnter={() => transition("virtual-room")}
      >
        <VirtualRoom />
      </Portal>
      <SceneBoundary showGuardian />
    </>
  );
}
```

## License

[MIT](../../LICENSE)
