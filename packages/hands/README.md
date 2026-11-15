# @allem-xr/hands

Hand tracking, gesture recognition, pinch and grab detection for React XR.

## Installation

```bash
npm install @allem-xr/hands @allem-xr/core
```

## Usage

```tsx
import { useHands, useGesture, usePinch } from "@allem-xr/hands";

function HandTracker() {
  const { left, right } = useHands();
  const gesture = useGesture("right");
  const pinch = usePinch("right");

  return (
    <div>
      <p>Right hand gesture: {gesture?.name ?? "none"}</p>
      <p>Pinching: {pinch.isPinching ? "Yes" : "No"}</p>
    </div>
  );
}
```

## License

[MIT](../../LICENSE)
