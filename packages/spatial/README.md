# @allem-xr/spatial

Spatial anchors, hit testing, plane detection, and scene mesh for React XR.

## Installation

```bash
npm install @allem-xr/spatial @allem-xr/core
```

## Usage

```tsx
import { useSpatialAnchor, useHitTest, usePlaneDetection } from "@allem-xr/spatial";

function SpatialScene() {
  const { anchors, createAnchor } = useSpatialAnchor();
  const hitResult = useHitTest();
  const { planes } = usePlaneDetection();

  return (
    <div>
      <p>Anchors: {anchors.length}</p>
      <p>Planes detected: {planes.length}</p>
    </div>
  );
}
```

## License

[MIT](../../LICENSE)
