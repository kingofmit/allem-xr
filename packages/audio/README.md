# @allem-xr/audio

Spatial audio with HRTF, audio zones, and ambient sound for Allem XR.

## Installation

```bash
npm install @allem-xr/audio @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { SpatialAudioSource, AudioZone, useAudioListener } from '@allem-xr/audio'

function AudioScene() {
  useAudioListener() // syncs Web Audio listener to camera

  return (
    <>
      <SpatialAudioSource src="/sounds/bird.mp3" position={[2, 3, -1]} loop autoplay />
      <AudioZone position={[0, 0, 0]} radius={5} reverb="hall">
        <SpatialAudioSource src="/sounds/echo.mp3" autoplay loop />
      </AudioZone>
    </>
  )
}
```

## Hooks

### `useSpatialAudio(src, config?)`

Play audio at a 3D position with HRTF spatialization.

```tsx
const audio = useSpatialAudio('/sounds/effect.mp3', {
  position: [1, 0, -2],
  maxDistance: 10,
  loop: true,
  hrtf: true,
})

audio.play()
audio.setPosition(2, 1, -3)
```

| Config | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `[x, y, z]` | `[0, 0, 0]` | Initial 3D position |
| `maxDistance` | `number` | `10` | Max audible distance |
| `rolloffFactor` | `number` | `1` | Distance rolloff |
| `refDistance` | `number` | `1` | Reference distance |
| `coneInnerAngle` | `number` | -- | Inner cone angle |
| `coneOuterAngle` | `number` | -- | Outer cone angle |
| `coneOuterGain` | `number` | -- | Gain outside outer cone |
| `loop` | `boolean` | -- | Loop playback |
| `volume` | `number` | -- | Volume level |
| `autoplay` | `boolean` | -- | Auto-start playback |
| `hrtf` | `boolean` | -- | Enable HRTF panning |

Returns `SpatialAudioState`:

| Method / Field | Type | Description |
|----------------|------|-------------|
| `play()` | `() => void` | Start playback |
| `pause()` | `() => void` | Pause playback |
| `stop()` | `() => void` | Stop and reset |
| `seek(time)` | `(time: number) => void` | Seek to time |
| `setPosition(x, y, z)` | `(x, y, z) => void` | Move audio source |
| `setVolume(v)` | `(volume: number) => void` | Change volume |
| `isPlaying` | `boolean` | Playing state |
| `currentTime` | `number` | Current playback time |
| `duration` | `number` | Total duration |

### `useAudioListener()`

Syncs the Web Audio API listener position/orientation to the Three.js camera. Call once inside your scene.

```tsx
useAudioListener()
```

### `useAmbientAudio(src, options?)`

Non-spatial audio playback for background music or ambience.

```tsx
const ambient = useAmbientAudio('/sounds/background.mp3', {
  volume: 0.3,
  loop: true,
  autoplay: true,
})
```

## Components

### `<SpatialAudioSource>`

Declarative spatial audio source component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Audio file URL |
| `position` | `[x, y, z]` | -- | 3D position |
| `maxDistance` | `number` | -- | Max audible distance |
| `rolloffFactor` | `number` | -- | Distance rolloff |
| `refDistance` | `number` | -- | Reference distance |
| `loop` | `boolean` | -- | Loop playback |
| `volume` | `number` | -- | Volume level |
| `autoplay` | `boolean` | -- | Auto-start |
| `hrtf` | `boolean` | -- | Enable HRTF |

### `<AudioZone>`

Defines a spatial region with audio properties (reverb, dampening).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[x, y, z]` | -- | Zone center |
| `radius` | `number` | -- | Zone radius |
| `volume` | `number` | -- | Volume within zone |
| `reverb` | `'none' \| 'small-room' \| 'hall' \| 'cave' \| 'outdoor'` | -- | Reverb preset |
| `dampening` | `number` | -- | Sound dampening |

### `<AmbientAudio>`

Declarative non-spatial audio component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Audio file URL |
| `volume` | `number` | -- | Volume level |
| `loop` | `boolean` | -- | Loop playback |
| `autoplay` | `boolean` | -- | Auto-start |

## Utilities

### `getAudioContext()`

Returns the shared `AudioContext` instance.

### `resumeAudioContext()`

Resumes a suspended audio context (required after user gesture on some browsers).

## License

MIT
