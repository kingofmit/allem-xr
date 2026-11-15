# @allem-xr/core

XR session management, context provider, and mode detection for React.

## Installation

```bash
npm install @allem-xr/core
```

## Usage

```tsx
import { XRProvider, useXR, useSession } from "@allem-xr/core";

function Scene() {
  const { isPresenting, mode } = useXR();
  const { start, end } = useSession();

  return (
    <div>
      <p>Mode: {mode} | Presenting: {isPresenting ? "Yes" : "No"}</p>
      <button onClick={() => start("immersive-ar")}>Enter AR</button>
      <button onClick={end}>Exit</button>
    </div>
  );
}

function App() {
  return (
    <XRProvider>
      <Scene />
    </XRProvider>
  );
}
```

## License

[MIT](../../LICENSE)
