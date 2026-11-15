# @allem-xr/avatars

Avatar rendering, inverse kinematics, and skeleton tracking for React XR.

## Installation

```bash
npm install @allem-xr/avatars @allem-xr/core
```

## Usage

```tsx
import { useAvatar, AvatarRenderer } from "@allem-xr/avatars";

function MyAvatar() {
  const avatar = useAvatar({
    modelUrl: "/models/avatar.glb",
  });

  return <AvatarRenderer avatar={avatar} />;
}
```

## License

[MIT](../../LICENSE)
