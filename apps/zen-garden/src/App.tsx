import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import { UIProvider, Panel, Text, ProgressBar } from '@allem-xr/ui'
import { useAudioListener } from '@allem-xr/audio'
import { Guardian } from '@allem-xr/portals'

// ── WATER POOL ──
function WaterPool() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshPhysicalMaterial
    // Subtle shimmer
    mat.roughness = 0.05 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02
  })

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
      <circleGeometry args={[1.8, 64]} />
      <meshPhysicalMaterial
        color="#0a2a2a"
        roughness={0.05}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.02}
        transparent
        opacity={0.92}
        envMapIntensity={0.8}
      />
    </mesh>
  )
}

// ── STONES ──
function Stone({ position, scale, color }: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.85}
        metalness={0.02}
        clearcoat={0.1}
        clearcoatRoughness={0.4}
      />
    </mesh>
  )
}

function StoneArrangement() {
  const stones = [
    { pos: [-0.6, 0.08, -0.3] as [number, number, number], scale: [0.12, 0.08, 0.1] as [number, number, number], color: '#3a3a3a' },
    { pos: [-0.4, 0.06, -0.15] as [number, number, number], scale: [0.08, 0.06, 0.07] as [number, number, number], color: '#4a4a44' },
    { pos: [-0.7, 0.1, -0.5] as [number, number, number], scale: [0.15, 0.1, 0.12] as [number, number, number], color: '#333330' },
    { pos: [0.8, 0.07, 0.4] as [number, number, number], scale: [0.1, 0.07, 0.09] as [number, number, number], color: '#3d3d38' },
    { pos: [0.9, 0.12, 0.2] as [number, number, number], scale: [0.14, 0.09, 0.11] as [number, number, number], color: '#2e2e2a' },
    { pos: [1.1, 0.05, 0.5] as [number, number, number], scale: [0.07, 0.05, 0.06] as [number, number, number], color: '#454540' },
    { pos: [0, 0.15, -1.2] as [number, number, number], scale: [0.18, 0.12, 0.15] as [number, number, number], color: '#2a2a28' },
  ]

  return (
    <>
      {stones.map((s, i) => (
        <Stone key={i} position={s.pos} scale={s.scale} color={s.color} />
      ))}
    </>
  )
}

// ── SAND GROUND ──
function SandGround() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshPhysicalMaterial
        color="#c4b08a"
        roughness={0.95}
        metalness={0}
        clearcoat={0}
      />
    </mesh>
  )
}

// ── CHERRY BLOSSOM PETALS ──
function BlossomPetals() {
  const count = 40
  const petals = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * 5,
      y: 1 + Math.random() * 2,
      z: (Math.random() - 0.5) * 5,
      speed: 0.1 + Math.random() * 0.15,
      drift: Math.random() * Math.PI * 2,
      rotSpeed: 0.3 + Math.random() * 0.5,
      size: 0.008 + Math.random() * 0.006,
    })),
    []
  )

  return (
    <>
      {petals.map((p, i) => (
        <Petal key={i} {...p} index={i} />
      ))}
    </>
  )
}

function Petal({ x, y, z, speed, drift, rotSpeed, size, index }: {
  x: number; y: number; z: number; speed: number
  drift: number; rotSpeed: number; size: number; index: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + index
    ref.current.position.y = ((y - t * 0.15) % 3) + 0.5
    if (ref.current.position.y < 0.02) ref.current.position.y = 2.5
    ref.current.position.x = x + Math.sin(t + drift) * 0.3
    ref.current.position.z = z + Math.cos(t * 0.7 + drift) * 0.2
    ref.current.rotation.x = t * rotSpeed
    ref.current.rotation.z = t * rotSpeed * 0.7
  })

  return (
    <mesh ref={ref} position={[x, y, z]}>
      <planeGeometry args={[size, size * 0.7]} />
      <meshBasicMaterial
        color="#ffb7c5"
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── FIREFLIES ──
function Fireflies() {
  const count = 20

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Firefly key={i} index={i} />
      ))}
    </>
  )
}

function Firefly({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const baseX = (Math.random() - 0.5) * 4
  const baseY = 0.3 + Math.random() * 1.2
  const baseZ = (Math.random() - 0.5) * 4
  const speed = 0.2 + Math.random() * 0.3

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + index * 2
    ref.current.position.x = baseX + Math.sin(t) * 0.15
    ref.current.position.y = baseY + Math.sin(t * 1.5) * 0.08
    ref.current.position.z = baseZ + Math.cos(t * 0.8) * 0.12
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.3 + Math.sin(t * 3) * 0.3
  })

  return (
    <mesh ref={ref} position={[baseX, baseY, baseZ]}>
      <sphereGeometry args={[0.006, 6, 6]} />
      <meshBasicMaterial color="#ffee88" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

// ── BAMBOO STALKS ──
function BambooCluster({ position }: { position: [number, number, number] }) {
  const stalks = [
    { offset: [0, 0, 0], height: 2.2, lean: 0.02 },
    { offset: [0.12, 0, 0.05], height: 1.8, lean: -0.015 },
    { offset: [-0.08, 0, 0.1], height: 2.5, lean: 0.01 },
    { offset: [0.05, 0, -0.08], height: 1.5, lean: -0.02 },
  ]

  return (
    <group position={position}>
      {stalks.map((s, i) => (
        <group key={i} position={s.offset as [number, number, number]}>
          <mesh position={[0, s.height / 2, 0]} rotation-z={s.lean} castShadow>
            <cylinderGeometry args={[0.015, 0.02, s.height, 8]} />
            <meshPhysicalMaterial color="#4a6a3a" roughness={0.7} metalness={0.05} />
          </mesh>
          {/* Nodes */}
          {Array.from({ length: Math.floor(s.height / 0.4) }).map((_, j) => (
            <mesh key={j} position={[0, 0.3 + j * 0.4, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.008, 8]} />
              <meshPhysicalMaterial color="#3a5a2a" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ── BREATHING GUIDE (spatial UI) ──
function BreathingGuide() {
  const ref = useRef<{ progress: number; phase: string }>({ progress: 0, phase: 'inhale' })
  const progressRef = useRef(0)
  const phaseRef = useRef('Inhale')

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cycle = t % 12 // 4s inhale, 4s hold, 4s exhale
    if (cycle < 4) {
      progressRef.current = cycle / 4
      phaseRef.current = 'Inhale'
    } else if (cycle < 8) {
      progressRef.current = 1
      phaseRef.current = 'Hold'
    } else {
      progressRef.current = 1 - (cycle - 8) / 4
      phaseRef.current = 'Exhale'
    }
  })

  return (
    <Panel
      position={[-1.2, 1.3, -0.5]}
      width={0.28}
      height={0.2}
      backgroundColor="#0a0a14"
      backgroundOpacity={0.75}
    >
      <Text position={[-0.11, 0.07, 0]} fontSize={0.016} color="#c4b5fd" bold>
        Breathe
      </Text>
      <Text position={[-0.11, 0.04, 0]} fontSize={0.01} color="#64748b">
        4-4-4 cycle
      </Text>
      <ProgressBar
        position={[-0.11, -0.01, 0]}
        value={0.5}
        width={0.22}
        color="#818cf8"
        trackColor="#1e1e2e"
      />
      <Text position={[-0.11, -0.06, 0]} fontSize={0.009} color="#94a3b8">
        Focus on the breath
      </Text>
    </Panel>
  )
}

// ── AUDIO ──
function AudioSetup() {
  useAudioListener()
  return null
}

// ── MAIN SCENE ──
function XRContent() {
  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" model="spheres" color="#c4b5fd" opacity={0.4} jointSize={0.003} />
      <HandModel hand="right" model="spheres" color="#c4b5fd" opacity={0.4} jointSize={0.003} />

      {/* Scene */}
      <SandGround />
      <WaterPool />
      <StoneArrangement />
      <BlossomPetals />
      <Fireflies />

      {/* Bamboo */}
      <BambooCluster position={[-2.5, 0, -1.5]} />
      <BambooCluster position={[2.8, 0, -2]} />
      <BambooCluster position={[-1.5, 0, 2]} />

      {/* Spatial UI */}
      <UIProvider>
        <BreathingGuide />
      </UIProvider>

      {/* Guardian */}
      <Guardian radius={3.5} color="#c4b5fd" fadeDistance={0.8} />

      {/* Audio */}
      <AudioSetup />

      {/* Lighting — warm dusk */}
      <ambientLight intensity={0.12} color="#ffeedd" />
      <directionalLight
        position={[4, 6, -3]}
        intensity={0.4}
        color="#ffddbb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={15}
        shadow-bias={-0.001}
      />
      <pointLight position={[0, 0.3, 0]} intensity={0.1} color="#aaddff" distance={4} />
      <pointLight position={[-2, 1, -1]} intensity={0.05} color="#ffccaa" distance={3} />

      {/* Environment */}
      <Environment preset="sunset" />
      <fog attach="fog" args={['#0a0a12', 3, 10]} />

      {/* Desktop controls */}
      <OrbitControls
        target={[0, 0.3, -0.5]}
        enableDamping
        dampingFactor={0.03}
        rotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={1.5}
        maxDistance={5}
      />
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
        <h1>Zen Garden</h1>
        <p>A moment of stillness</p>
      </div>
      <div className="ui-overlay">
        {support.vr && (
          <button className="xr-button xr-vr" onClick={() => start('immersive-vr')}>
            Enter VR
          </button>
        )}
        {support.ar && (
          <button className="xr-button xr-ar" onClick={() => start('immersive-ar')}>
            Enter AR
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
        <Canvas
          camera={{ position: [1.5, 1, 1.5], fov: 50 }}
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8,
          }}
        >
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
