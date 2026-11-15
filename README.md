<p align="center">
  <img src=".github/AllemXR.png" alt="Allem XR" />
</p>

<p align="center">
  <a href="https://doi.org/10.5281/zenodo.24243178"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.24243178.svg" alt="DOI" /></a>
  <a href="https://www.npmjs.com/package/@allem-xr/core"><img src="https://img.shields.io/npm/v/@allem-xr/core.svg" alt="npm version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-strict-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/WebXR-ready-blueviolet" alt="WebXR" />
</p>

The React SDK for Mixed Reality — hand tracking, spatial UI, and immersive experiences. One install, zero lock-in.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@allem-xr/core` | XR session management, context provider, mode detection | [![npm](https://img.shields.io/npm/v/@allem-xr/core.svg)](https://www.npmjs.com/package/@allem-xr/core) |
| `@allem-xr/hands` | Hand tracking, gesture recognition, pinch & grab detection | [![npm](https://img.shields.io/npm/v/@allem-xr/hands.svg)](https://www.npmjs.com/package/@allem-xr/hands) |
| `@allem-xr/spatial` | Spatial anchors, hit testing, plane detection, scene mesh | [![npm](https://img.shields.io/npm/v/@allem-xr/spatial.svg)](https://www.npmjs.com/package/@allem-xr/spatial) |
| `@allem-xr/ui` | Spatial panels, buttons, menus, and gaze pointer | [![npm](https://img.shields.io/npm/v/@allem-xr/ui.svg)](https://www.npmjs.com/package/@allem-xr/ui) |
| `@allem-xr/audio` | Spatial audio, audio zones, HRTF rendering | [![npm](https://img.shields.io/npm/v/@allem-xr/audio.svg)](https://www.npmjs.com/package/@allem-xr/audio) |
| `@allem-xr/physics` | Physics world, rigid bodies, collisions, gravity | [![npm](https://img.shields.io/npm/v/@allem-xr/physics.svg)](https://www.npmjs.com/package/@allem-xr/physics) |
| `@allem-xr/avatars` | Avatar rendering, inverse kinematics, skeleton tracking | [![npm](https://img.shields.io/npm/v/@allem-xr/avatars.svg)](https://www.npmjs.com/package/@allem-xr/avatars) |
| `@allem-xr/portals` | AR passthrough portals, scene transitions, boundaries | [![npm](https://img.shields.io/npm/v/@allem-xr/portals.svg)](https://www.npmjs.com/package/@allem-xr/portals) |

## Quick Start

```bash
npm install @allem-xr/core @allem-xr/hands
```

```tsx
import { XRProvider, useXR } from "@allem-xr/core";
import { useHands } from "@allem-xr/hands";

function Scene() {
  const { isPresenting, mode } = useXR();
  const { left, right } = useHands();

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>Left hand joints: {left?.joints.length ?? 0}</p>
      <p>Right hand joints: {right?.joints.length ?? 0}</p>
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

## Tech Stack

- [React 19](https://react.dev/) with `"use client"` directives
- [WebXR Device API](https://www.w3.org/TR/webxr/) for immersive sessions
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) workspaces
- [tsup](https://tsup.egoist.dev/) (ESM + CJS builds)
- [Changesets](https://github.com/changesets/changesets) for versioning

## Development

```bash
git clone https://github.com/kingofmit/allem-xr.git
cd allem-xr
pnpm install
pnpm build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## Support

If you find Allem XR useful, consider supporting its development:

<a href="https://buymeacoffee.com/kingofmit" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" /></a>

## License

[MIT](./LICENSE) - [Ahmed Allem](https://kingallem.com)
