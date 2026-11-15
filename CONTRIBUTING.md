# Contributing

Thanks for your interest in contributing to Allem XR.

## Setup

```bash
git clone https://github.com/kingofmit/allem-xr.git
cd allem-xr
pnpm install
pnpm build
```

Requires Node.js >= 20 and [pnpm](https://pnpm.io/) >= 9.

## Project Structure

```
packages/
  core/       @allem-xr/core       XR session management & context
  hands/      @allem-xr/hands      Hand tracking & gesture recognition
  spatial/    @allem-xr/spatial     Spatial anchors & plane detection
  ui/         @allem-xr/ui          Spatial UI components
  audio/      @allem-xr/audio       Spatial audio & HRTF
  physics/    @allem-xr/physics     Physics simulation & collisions
  avatars/    @allem-xr/avatars     Avatar rendering & inverse kinematics
  portals/    @allem-xr/portals     AR portals & scene transitions
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch mode |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Remove build artifacts |

## Pull Requests

1. Fork and clone the repo
2. Create a branch from `main`: `git checkout -b feat/my-feature`
3. Make your changes and add tests
4. Run `pnpm build`
5. Create a changeset: `pnpm changeset`
6. Open a PR against `main`

## Conventions

- TypeScript strict mode
- One hook per file
- SSR-safe: check `typeof window` before browser APIs
- `"use client"` directive added automatically via tsup
- Export types alongside implementations

## Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning. Run `pnpm changeset` when making user-facing changes.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
