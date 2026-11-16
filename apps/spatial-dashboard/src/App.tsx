import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import {
  UIProvider,
  Panel,
  Button,
  Text,
  Slider,
  Toggle,
  ProgressBar,
  GazePointer,
} from '@allem-xr/ui'

function ControlsPanel() {
  const [volume, setVolume] = useState(0.7)
  const [brightness, setBrightness] = useState(0.5)
  const [shadows, setShadows] = useState(true)
  const [antiAlias, setAntiAlias] = useState(true)

  return (
    <Panel
      position={[-0.5, 1.6, -1.5]}
      width={0.5}
      height={0.45}
      backgroundColor="#111122"
      backgroundOpacity={0.9}
    >
      <Text position={[-0.2, 0.18, 0]} fontSize={0.025} color="#ffffff" bold>
        Settings
      </Text>
      <Slider
        position={[-0.2, 0.1, 0]}
        value={volume}
        onChange={setVolume}
        width={0.35}
        label="Volume"
      />
      <Slider
        position={[-0.2, 0.02, 0]}
        value={brightness}
        onChange={setBrightness}
        width={0.35}
        label="Brightness"
      />
      <Toggle
        position={[-0.2, -0.06, 0]}
        checked={shadows}
        onChange={setShadows}
        label="Shadows"
      />
      <Toggle
        position={[-0.2, -0.12, 0]}
        checked={antiAlias}
        onChange={setAntiAlias}
        label="Anti-Aliasing"
      />
    </Panel>
  )
}

function StatusPanel() {
  const [progress, setProgress] = useState(0.35)

  return (
    <Panel
      position={[0.5, 1.6, -1.5]}
      width={0.45}
      height={0.35}
      backgroundColor="#112211"
      backgroundOpacity={0.9}
    >
      <Text position={[-0.18, 0.13, 0]} fontSize={0.025} color="#ffffff" bold>
        Status
      </Text>
      <ProgressBar
        position={[-0.18, 0.06, 0]}
        value={progress}
        width={0.32}
        label="Loading"
        color="#44cc88"
      />
      <ProgressBar
        position={[-0.18, -0.02, 0]}
        value={0.85}
        width={0.32}
        label="CPU"
        color="#ffaa44"
      />
      <ProgressBar
        position={[-0.18, -0.1, 0]}
        value={0.45}
        width={0.32}
        label="Memory"
        color="#4488ff"
      />
      <Button
        position={[0, -0.14, 0]}
        width={0.15}
        height={0.035}
        color="#225533"
        hoverColor="#33aa66"
        fontSize={0.013}
        onSelect={() => setProgress(Math.random())}
      >
        Refresh
      </Button>
    </Panel>
  )
}

function ActionsPanel() {
  const [count, setCount] = useState(0)

  return (
    <Panel
      position={[0, 1.2, -1.8]}
      width={0.6}
      height={0.2}
      backgroundColor="#221111"
      backgroundOpacity={0.9}
    >
      <Text position={[-0.25, 0.06, 0]} fontSize={0.022} color="#ffffff" bold>
        Actions
      </Text>
      <Button
        position={[-0.15, -0.03, 0]}
        width={0.13}
        height={0.04}
        color="#cc3333"
        hoverColor="#ff4444"
        onSelect={() => setCount(c => c + 1)}
      >
        Click me
      </Button>
      <Button
        position={[0.05, -0.03, 0]}
        width={0.13}
        height={0.04}
        color="#3333cc"
        hoverColor="#4444ff"
        onSelect={() => setCount(0)}
      >
        Reset
      </Button>
      <Text position={[0.2, -0.03, 0]} fontSize={0.018} color="#aaaaaa">
        {`Count: ${count}`}
      </Text>
    </Panel>
  )
}

function XRContent() {
  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" color="#00ffaa" />
      <HandModel hand="right" color="#00aaff" />

      {/* UI System */}
      <UIProvider>
        <GazePointer size={0.004} />
        <ControlsPanel />
        <StatusPanel />
        <ActionsPanel />
      </UIProvider>

      {/* Environment */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} intensity={0.6} />
      <gridHelper args={[10, 20, '#333', '#222']} />

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Desktop controls */}
      <OrbitControls target={[0, 1.4, -1.5]} />
    </XRScene>
  )
}

function UI() {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) return null

  return (
    <>
      <div className="info-text">
        Spatial Dashboard — Floating UI panels you can interact with in XR
      </div>
      <div className="ui-overlay">
        {support.ar && (
          <button className="xr-button xr-ar" onClick={() => start('immersive-ar')}>
            Enter AR
          </button>
        )}
        {support.vr && (
          <button className="xr-button xr-vr" onClick={() => start('immersive-vr')}>
            Enter VR
          </button>
        )}
      </div>
    </>
  )
}

export default function App() {
  return (
    <XRProvider features={['hand-tracking', 'local-floor']}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas camera={{ position: [0, 1.6, 1], fov: 60 }}>
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
