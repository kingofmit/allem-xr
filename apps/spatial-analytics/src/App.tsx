import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import { UIProvider, Panel, Text, Button, Slider, Toggle, ProgressBar, GazePointer } from '@allem-xr/ui'

// ── 3D BAR CHART ──
function BarChart3D({ position }: { position: [number, number, number] }) {
  const data = [0.65, 0.82, 0.45, 0.93, 0.71, 0.56, 0.88, 0.39, 0.77, 0.61, 0.84, 0.52]
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const colors = data.map(v => {
    if (v > 0.8) return '#34d399'
    if (v > 0.6) return '#60a5fa'
    if (v > 0.4) return '#fbbf24'
    return '#f87171'
  })

  return (
    <group position={position}>
      {data.map((v, i) => (
        <AnimatedBar key={i} index={i} value={v} color={colors[i]} total={data.length} />
      ))}
      {/* Base plate */}
      <mesh position={[0, -0.005, 0]} receiveShadow>
        <boxGeometry args={[0.55, 0.01, 0.15]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.8} metalness={0.2} clearcoat={0.3} />
      </mesh>
    </group>
  )
}

function AnimatedBar({ index, value, color, total }: {
  index: number; value: number; color: string; total: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  const targetHeight = value * 0.2

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    // Animate in with stagger
    const delay = index * 0.08
    const progress = Math.min(1, Math.max(0, (t - delay) * 2))
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
    const h = targetHeight * eased
    ref.current.scale.y = Math.max(0.001, h)
    ref.current.position.y = h / 2
  })

  const x = (index / (total - 1) - 0.5) * 0.48

  return (
    <mesh ref={ref} position={[x, 0, 0]} castShadow>
      <boxGeometry args={[0.028, 1, 0.06]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        metalness={0.4}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  )
}

// ── RING CHART ──
function RingChart({ position, value, color, label }: {
  position: [number, number, number]
  value: number
  color: string
  label: string
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = -Math.PI / 2 // Start from top
  })

  const segments = 64
  const angle = value * Math.PI * 2

  return (
    <group position={position}>
      {/* Background ring */}
      <mesh>
        <torusGeometry args={[0.06, 0.008, 8, segments]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Value ring */}
      <mesh rotation-z={-Math.PI / 2}>
        <torusGeometry args={[0.06, 0.01, 8, segments, angle]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.1}
          metalness={0.6}
          clearcoat={1}
        />
      </mesh>
      {/* Center text */}
      <Text position={[0, 0.01, 0.02]} fontSize={0.018} color={color} bold>
        {`${Math.round(value * 100)}%`}
      </Text>
      <Text position={[0, -0.02, 0.02]} fontSize={0.008} color="#64748b">
        {label}
      </Text>
    </group>
  )
}

// ── FLOATING DATA POINT ──
function DataOrb({ position, value, label }: {
  position: [number, number, number]
  value: string
  label: string
}) {
  return (
    <Float speed={1.5} floatIntensity={0.04} rotationIntensity={0}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.035, 24, 24]} />
          <meshPhysicalMaterial
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={0.1}
            roughness={0.05}
            metalness={0.8}
            clearcoat={1}
            transmission={0.2}
            thickness={0.5}
          />
        </mesh>
        <Text position={[0, 0.06, 0]} fontSize={0.014} color="#e0e7ff" bold>
          {value}
        </Text>
        <Text position={[0, 0.04, 0]} fontSize={0.007} color="#64748b">
          {label}
        </Text>
      </group>
    </Float>
  )
}

// ── MAIN DASHBOARD ──
function Dashboard() {
  const [timeRange, setTimeRange] = useState(0.75)
  const [showPrediction, setShowPrediction] = useState(true)

  return (
    <>
      {/* Main metrics panel */}
      <Panel
        position={[0, 1.55, -1.5]}
        width={0.7}
        height={0.42}
        backgroundColor="#0a0e1a"
        backgroundOpacity={0.88}
      >
        <Text position={[-0.3, 0.17, 0]} fontSize={0.02} color="#e0e7ff" bold>
          Revenue Analytics
        </Text>
        <Text position={[-0.3, 0.14, 0]} fontSize={0.009} color="#475569">
          Q4 2026 Performance Dashboard
        </Text>

        {/* 3D bar chart embedded */}
        <BarChart3D position={[0, -0.02, 0.05]} />

        {/* Time range slider */}
        <Slider
          position={[-0.3, -0.14, 0]}
          value={timeRange}
          onChange={setTimeRange}
          min={0}
          max={1}
          step={0.01}
          width={0.55}
          label="Time Range"
          fillColor="#818cf8"
        />
      </Panel>

      {/* KPI rings */}
      <Panel
        position={[-0.55, 1.55, -1.2]}
        width={0.3}
        height={0.42}
        backgroundColor="#0a0e1a"
        backgroundOpacity={0.85}
      >
        <Text position={[-0.12, 0.17, 0]} fontSize={0.015} color="#e0e7ff" bold>
          Key Metrics
        </Text>
        <RingChart position={[-0.04, 0.06, 0.02]} value={0.87} color="#34d399" label="Growth" />
        <RingChart position={[-0.04, -0.08, 0.02]} value={0.64} color="#60a5fa" label="Retention" />
      </Panel>

      {/* Controls panel */}
      <Panel
        position={[0.55, 1.55, -1.2]}
        width={0.28}
        height={0.42}
        backgroundColor="#0a0e1a"
        backgroundOpacity={0.85}
      >
        <Text position={[-0.11, 0.17, 0]} fontSize={0.015} color="#e0e7ff" bold>
          Settings
        </Text>

        <Toggle
          position={[-0.11, 0.1, 0]}
          checked={showPrediction}
          onChange={setShowPrediction}
          label="Predictions"
          activeColor="#818cf8"
        />

        <ProgressBar position={[-0.11, 0.02, 0]} value={0.92} width={0.2} label="Confidence" color="#34d399" trackColor="#1e293b" />
        <ProgressBar position={[-0.11, -0.05, 0]} value={0.78} width={0.2} label="Accuracy" color="#60a5fa" trackColor="#1e293b" />
        <ProgressBar position={[-0.11, -0.12, 0]} value={0.45} width={0.2} label="Risk Index" color="#fbbf24" trackColor="#1e293b" />

        <Button
          position={[0, -0.17, 0]}
          width={0.15}
          height={0.03}
          color="#1e1b4b"
          hoverColor="#312e81"
          fontSize={0.01}
          onSelect={() => console.log('Export report')}
        >
          Export Report
        </Button>
      </Panel>

      {/* Floating data points */}
      <DataOrb position={[-1, 1.9, -1.8]} value="$4.2M" label="Revenue" />
      <DataOrb position={[1, 1.9, -1.8]} value="12.4K" label="Users" />
      <DataOrb position={[0, 2.05, -2]} value="98.2%" label="Uptime" />
    </>
  )
}

// ── AMBIENT ──
function AmbientGrid() {
  return (
    <>
      <gridHelper args={[12, 48, '#0f172a', '#0a0f1e']} position={[0, 0.001, 0]} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#060810" roughness={0.98} />
      </mesh>
    </>
  )
}

function FloatingParticles() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.01
  })

  return (
    <group ref={ref}>
      {Array.from({ length: 30 }).map((_, i) => {
        const a = Math.random() * Math.PI * 2
        const r = 2 + Math.random() * 3
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.5 + Math.random() * 2.5, Math.sin(a) * r]}>
            <sphereGeometry args={[0.003, 4, 4]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.2 + Math.random() * 0.15} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── MAIN ──
function XRContent() {
  return (
    <XRScene>
      <XROrigin />

      <HandModel hand="left" model="spheres" color="#818cf8" opacity={0.4} jointSize={0.003} />
      <HandModel hand="right" model="spheres" color="#818cf8" opacity={0.4} jointSize={0.003} />

      <UIProvider>
        <GazePointer size={0.003} color="#e0e7ff" />
        <Dashboard />
      </UIProvider>

      <AmbientGrid />
      <FloatingParticles />

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 6, 3]} intensity={0.3} color="#c7d2fe" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, 3, -1.5]} intensity={0.2} color="#818cf8" distance={5} />

      <Environment preset="night" />
      <fog attach="fog" args={['#060810', 4, 12]} />

      <OrbitControls target={[0, 1.5, -1.3]} enableDamping dampingFactor={0.05} rotateSpeed={0.3} />
    </XRScene>
  )
}

function UI() {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()
  if (isActive) return null

  return (
    <>
      <div className="title-overlay">
        <h1>Spatial Analytics</h1>
        <p>Enterprise intelligence in 3D space</p>
      </div>
      <div className="status-pill">
        <span>Live</span> &middot; Q4 2026
      </div>
      <div className="ui-overlay">
        {support.vr && <button className="xr-button xr-vr" onClick={() => start('immersive-vr')}>Enter VR</button>}
        {support.ar && <button className="xr-button xr-ar" onClick={() => start('immersive-ar')}>Enter AR</button>}
      </div>
    </>
  )
}

export default function App() {
  return (
    <XRProvider features={['hand-tracking', 'local-floor']}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [0.8, 1.7, 1], fov: 55 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
        >
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
