# Changelog

All notable changes to Allem XR will be documented in this file.

## [0.1.0] - 2026-11-16

### Added

**Core (@allem-xr/core)**
- `XRProvider` — session management with capability detection
- `XRScene` — R3F bridge with per-frame XR state
- `XROrigin` — teleportation anchor
- `useXR`, `useXRSession`, `useXREvent`, `useXRSupport`, `useXRInput`, `useXRFrame` hooks
- Helpful error messages with device/browser support info
- Input abstraction for controllers, hands, gaze, and transient pointers

**Hands (@allem-xr/hands)**
- `useHands` — 25-joint hand tracking via WebXR Hand Input API
- `useGesture` — pinch, grab, point, fist, open-palm detection
- `useCustomGesture` — user-defined gesture detectors
- `usePinchInteraction`, `useGrabInteraction` — mesh interaction with velocity tracking
- `HandModel` — skeleton visualization with sphere/bone rendering
- `HandRay` — visible pointing ray from index finger

**Spatial (@allem-xr/spatial)**
- `useHitTest` — ray casting against real-world geometry
- `usePlanes` — real-world plane detection with semantic labels
- `useAnchor` — spatial anchors with persistent storage
- `useSceneMesh` — scene mesh reconstruction
- `useDepth` — depth sensing
- `useLightEstimate` — ambient light estimation
- `PlaneOverlay`, `SurfacePlacer`, `SceneMeshOccluder` components

**UI (@allem-xr/ui)**
- `Panel`, `Button`, `Text`, `Slider`, `Toggle`, `ProgressBar` — spatial UI in Three.js
- `Tooltip`, `RadialMenu`, `GazePointer` — interaction components
- `UIProvider` — raycasting interaction system
- `useGazeInteraction` — dwell-based selection
- SDF text rendering via troika-three-text

**Physics (@allem-xr/physics)**
- `PhysicsWorld` — Rapier WASM integration
- `RigidBody` — dynamic/fixed/kinematic bodies with auto-inferred colliders
- `RealWorldCollider` — real-world plane colliders
- `useCollision` — collision detection with manifold data
- `useHandPhysics` — kinematic bodies at hand joints
- `useGravity` — dynamic gravity control

**Audio (@allem-xr/audio)**
- `useSpatialAudio` — HRTF positional audio
- `useAudioListener` — camera-synced Web Audio listener
- `useAmbientAudio` — non-spatial background audio
- `SpatialAudioSource`, `AudioZone`, `AmbientAudio` components

**Avatars (@allem-xr/avatars)**
- `useAvatar` — GLB/VRM model loading
- `useAvatarTracking` — XR-driven IK targets
- `useIK` — FABRIK inverse kinematics solver
- `Avatar` — auto-tracking avatar component
- `AvatarMirror` — real-time mirror reflection

**Portals (@allem-xr/portals)**
- `Portal` — stencil-buffer window into virtual content
- `SceneTransition` — fade transitions
- `Guardian` — play area boundary with distance-based opacity
- `PassthroughWindow` — passthrough holes in VR
- `useSceneTransition`, `useGuardian`, `usePassthrough` hooks

**CLI (create-allem-xr)**
- `npx create-allem-xr my-app` scaffolding

**Demo Apps**
- Mixed Reality Playground (flagship, all 8 packages)
- Zen Garden (VR meditation)
- Spatial Analytics (enterprise dashboard)
- Physics Playground, Spatial Notes, Portal Gallery
- Avatar Mirror, Spatial Dashboard, Gesture Lab
