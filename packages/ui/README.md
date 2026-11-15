# @allem-xr/ui

Spatial UI components for React XR — floating panels, interactive buttons, menus, and gaze pointer.

## Installation

```bash
npm install @allem-xr/ui @allem-xr/core
```

## Usage

```tsx
import { SpatialPanel, SpatialButton, GazePointer } from "@allem-xr/ui";

function Menu() {
  return (
    <SpatialPanel position={{ x: 0, y: 1.5, z: -1 }}>
      <SpatialButton onSelect={() => console.log("Selected!")}>
        Click Me
      </SpatialButton>
      <GazePointer />
    </SpatialPanel>
  );
}
```

## License

[MIT](../../LICENSE)
