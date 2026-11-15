# @allem-xr/audio

Spatial audio, audio zones, and HRTF rendering for React XR.

## Installation

```bash
npm install @allem-xr/audio @allem-xr/core
```

## Usage

```tsx
import { useSpatialAudio, AudioZone } from "@allem-xr/audio";

function Scene() {
  const { play } = useSpatialAudio("/sounds/ambient.mp3", {
    position: { x: 0, y: 1, z: -2 },
  });

  return (
    <AudioZone position={{ x: 0, y: 0, z: 0 }} radius={5}>
      <button onClick={play}>Play</button>
    </AudioZone>
  );
}
```

## License

[MIT](../../LICENSE)
