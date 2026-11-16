import { useState, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Core
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'

// Hands
import { HandModel, HandRay, useGesture } from '@allem-xr/hands'

// Spatial
import { usePlanes, PlaneOverlay } from '@allem-xr/spatial'

// Physics
import { PhysicsWorld, RigidBody, RealWorldCollider, useHandPhysics, useGravity } from '@allem-xr/physics'

// UI
import { UIProvider, Panel, Button, Text, Slider, Toggle, ProgressBar, GazePointer } from '@allem-xr/ui'

// Audio
import { useAudioListener } from '@allem-xr/audio'

// Portals
import { Portal, Guardian } from '@allem-xr/portals'

// ============================================================
// ETHEREAL WORLD (inside the portal)
// ============================================================

function EtherealWorld() {
  return (
    <group>
      {/* Soft ground plane */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#1a3a2a" roughness={0.9} />
      </mesh>

      {/* Bioluminescent trees */}
      {[[-2, 0, -2], [2.5, 0, -1.5], [0, 0, -3.5], [-1.5, 0, -0.5], [1, 0, -2.8]].map(([x, y, z], i) => (
        <GlowTree key={`tree-${i}`} position={[x, y, z]} index={i} />
      ))}

      {/* Floating light orbs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 1.5 + Math.random() * 2
        return (
          <FloatingOrb
            key={`orb-${i}`}
            position={[Math.cos(angle) * r, 0.5 + Math.random() * 1.5, Math.sin(angle) * r - 2]}
            color={['#66ffcc', '#44aaff', '#cc88ff', '#ffaa66'][i % 4]}
            speed={0.5 + Math.random() * 0.5}
          />
        )
      })}

      {/* Ethereal fog particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <FogParticle key={`fog-${i}`} index={i} />
      ))}

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, -2]} intensity={1} color="#88ccff" distance={8} />
      <pointLight position={[-2, 1, -1]} intensity={0.5} color="#66ffcc" distance={5} />
      <pointLight position={[2, 2, -3]} intensity={0.5} color="#cc88ff" distance={5} />
    </group>
  )
}

function GlowTree({ position, index }: { position: [number, number, number]; index: number }) {
  const colors = ['#66ffcc', '#44aaff', '#cc88ff', '#ffaa66', '#ff88cc']
  const glowColor = colors[index % colors.length]
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    // Gentle sway
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.02
  })

  return (
    <group ref={ref} position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.07, 1.2, 12]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      {/* Canopy — glowing */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.4}
          roughness={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Inner glow light */}
      <pointLight position={[0, 1.4, 0]} color={glowColor} intensity={0.3} distance={2} />
    </group>
  )
}

function FloatingOrb({ position, color, speed }: {
  position: [number, number, number]
  color: string
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed
    ref.current.position.y = position[1] + Math.sin(t) * 0.15
    ref.current.position.x = position[0] + Math.sin(t * 0.7) * 0.05
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.025, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

function FogParticle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const startX = (Math.random() - 0.5) * 6
  const startZ = -1 - Math.random() * 4
  const startY = Math.random() * 0.5

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * 0.15 + index * 0.5
    ref.current.position.x = startX + Math.sin(t) * 0.3
    ref.current.position.y = startY + Math.sin(t * 1.3) * 0.1
    ref.current.position.z = startZ + Math.cos(t * 0.7) * 0.2
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(t * 2) * 0.015
  })

  return (
    <mesh ref={ref} position={[startX, startY, startZ]}>
      <planeGeometry args={[0.4, 0.4]} />
      <meshBasicMaterial color="#88ccff" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

// ============================================================
// GLASS PHYSICS OBJECTS
// ============================================================

interface SpawnedObject {
  id: string
  type: 'sphere' | 'cube' | 'gem'
  position: [number, number, number]
  color: string
}

const PALETTE = [
  '#f472b6', '#a78bfa', '#60a5fa', '#34d399',
  '#fbbf24', '#fb923c', '#f87171', '#c084fc',
]

function GlassSphere({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="ball" args={[0.06]} restitution={0.85} mass={0.3}>
      <mesh castShadow>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transmission={0.3}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>
    </RigidBody>
  )
}

function GlassCube({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="cuboid" args={[0.05, 0.05, 0.05]} restitution={0.4} mass={0.5}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </RigidBody>
  )
}

function GlassGem({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="ball" args={[0.05]} restitution={0.9} mass={0.2}>
      <Float speed={0} floatIntensity={0}>
        <mesh castShadow>
          <octahedronGeometry args={[0.05, 0]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.15}
            roughness={0.02}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
      </Float>
    </RigidBody>
  )
}

// ============================================================
// HAND PHYSICS + COLLIDERS
// ============================================================

function HandPhysicsController() {
  useHandPhysics({ hand: 'left' })
  useHandPhysics({ hand: 'right' })
  return null
}

function WorldColliders() {
  const { planes } = usePlanes({ filter: 'all' })
  return <RealWorldCollider source="planes" planes={planes} friction={0.7} restitution={0.3} />
}

// ============================================================
// GLASS CONTROL PANEL
// ============================================================

function ControlPanel({ onSpawn, objectCount }: {
  onSpawn: (type: 'sphere' | 'cube' | 'gem') => void
  objectCount: number
}) {
  const [gravityStrength, setGravityStrength] = useState(1)
  const [showPlanes, setShowPlanes] = useState(true)
  const { setGravity } = useGravity()

  const handleGravityChange = useCallback((v: number) => {
    setGravityStrength(v)
    setGravity([0, -9.81 * v, 0])
  }, [setGravity])

  return (
    <Panel
      position={[0.55, 1.5, -0.7]}
      width={0.38}
      height={0.46}
      backgroundColor="#0d0d1a"
      backgroundOpacity={0.88}
    >
      <Text position={[-0.15, 0.18, 0]} fontSize={0.019} color="#e0e7ff" bold>
        Control Panel
      </Text>

      <Text position={[-0.15, 0.135, 0]} fontSize={0.009} color="#64748b">
        Spawn Objects
      </Text>

      <Button position={[-0.1, 0.095, 0]} width={0.07} height={0.028} color="#3f1a28" hoverColor="#7f2450" fontSize={0.009} onSelect={() => onSpawn('sphere')}>
        Sphere
      </Button>
      <Button position={[0, 0.095, 0]} width={0.07} height={0.028} color="#1a2840" hoverColor="#244080" fontSize={0.009} onSelect={() => onSpawn('cube')}>
        Cube
      </Button>
      <Button position={[0.1, 0.095, 0]} width={0.07} height={0.028} color="#2a1a40" hoverColor="#4a2480" fontSize={0.009} onSelect={() => onSpawn('gem')}>
        Gem
      </Button>

      <Slider position={[-0.15, 0.03, 0]} value={gravityStrength} onChange={handleGravityChange} min={0} max={2} step={0.05} width={0.28} label="Gravity" fillColor="#818cf8" />

      <Toggle position={[-0.15, -0.04, 0]} checked={showPlanes} onChange={setShowPlanes} label="Plane Overlay" activeColor="#818cf8" />

      <ProgressBar position={[-0.15, -0.1, 0]} value={Math.min(1, objectCount / 30)} width={0.28} label={`Objects: ${objectCount}`} color="#34d399" trackColor="#1e293b" />

      <Text position={[-0.15, -0.17, 0]} fontSize={0.008} color="#475569" maxWidth={0.32}>
        Pinch to grab. Open palm to push. Adjust gravity to float.
      </Text>
    </Panel>
  )
}

// ============================================================
// AUDIO + GESTURE FEEDBACK
// ============================================================

function AudioSetup() {
  useAudioListener()
  return null
}

function GestureFeedback() {
  const rightPinch = useGesture('pinch', { hand: 'right' })
  const leftPinch = useGesture('pinch', { hand: 'left' })

  return (
    <>
      {rightPinch.active && rightPinch.position && (
        <mesh position={rightPinch.position}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.7} />
        </mesh>
      )}
      {leftPinch.active && leftPinch.position && (
        <mesh position={leftPinch.position}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
        </mesh>
      )}
    </>
  )
}

// ============================================================
// AMBIENT ENVIRONMENT (floating particles, ground)
// ============================================================

function AmbientParticles() {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <group ref={ref}>
      {Array.from({ length: 50 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2
        const r = 2 + Math.random() * 4
        const y = Math.random() * 3
        return (
          <mesh key={i} position={[Math.cos(theta) * r, y, Math.sin(theta) * r]}>
            <sphereGeometry args={[0.004, 4, 4]} />
            <meshBasicMaterial color="#c4b5fd" transparent opacity={0.3 + Math.random() * 0.2} />
          </mesh>
        )
      })}
    </group>
  )
}

// ============================================================
// MAIN XR CONTENT
// ============================================================

function XRContent({ objects, onSpawn }: {
  objects: SpawnedObject[]
  onSpawn: (type: 'sphere' | 'cube' | 'gem') => void
}) {
  return (
    <XRScene>
      <XROrigin />

      {/* === HANDS (soft translucent) === */}
      <HandModel hand="left" model="spheres" color="#a78bfa" opacity={0.5} jointSize={0.004} />
      <HandModel hand="right" model="spheres" color="#60a5fa" opacity={0.5} jointSize={0.004} />
      <HandRay hand="right" color="#818cf8" opacity={0.15} maxLength={5} />

      {/* === PORTAL to ethereal world === */}
      <Portal
        position={[0, 1.1, -2.8]}
        size={[1.3, 1.9]}
        borderColor="#818cf8"
        borderWidth={0.015}
      >
        <EtherealWorld />
      </Portal>

      {/* === PHYSICS === */}
      <PhysicsWorld gravity={[0, -9.81, 0]}>
        <HandPhysicsController />
        <WorldColliders />

        {objects.map(obj => {
          switch (obj.type) {
            case 'sphere': return <GlassSphere key={obj.id} position={obj.position} color={obj.color} />
            case 'cube': return <GlassCube key={obj.id} position={obj.position} color={obj.color} />
            case 'gem': return <GlassGem key={obj.id} position={obj.position} color={obj.color} />
          }
        })}

        {/* Ground plane */}
        <RigidBody type="fixed" position={[0, -0.005, 0]} collider="cuboid" args={[5, 0.005, 5]}>
          <mesh receiveShadow>
            <boxGeometry args={[10, 0.01, 10]} />
            <meshStandardMaterial color="#0f0f1a" roughness={0.95} metalness={0.05} />
          </mesh>
        </RigidBody>

        {/* Spatial UI (inside PhysicsWorld for gravity) */}
        <UIProvider>
          <GazePointer size={0.003} color="#e0e7ff" />
          <ControlPanel onSpawn={onSpawn} objectCount={objects.length} />
        </UIProvider>
      </PhysicsWorld>

      {/* === SPATIAL OVERLAYS === */}
      <PlaneOverlay filter="all" color="#818cf8" opacity={0.04} />
      <GestureFeedback />
      <Guardian radius={3} color="#818cf8" fadeDistance={0.8} />
      <AudioSetup />

      {/* === LIGHTING — soft, directional, cinematic === */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
        color="#e0e7ff"
      />
      <pointLight position={[-3, 2, 2]} intensity={0.15} color="#818cf8" distance={8} />
      <pointLight position={[3, 2, -2]} intensity={0.15} color="#f472b6" distance={8} />

      {/* Soft ambient glow from below */}
      <pointLight position={[0, -0.5, 0]} intensity={0.08} color="#818cf8" distance={6} />

      {/* === ENVIRONMENT === */}
      <AmbientParticles />
      <Environment preset="night" />
      <fog attach="fog" args={['#080810', 4, 14]} />

      {/* Subtle ground grid */}
      <gridHelper args={[12, 48, '#1a1a2e', '#12121e']} position={[0, 0.001, 0]} />

      {/* Desktop controls */}
      <OrbitControls target={[0, 1, -1.2]} enableDamping dampingFactor={0.05} />
    </XRScene>
  )
}

// ============================================================
// HTML UI (visionOS glass)
// ============================================================

function UI({ onSpawn }: { onSpawn: (type: 'sphere' | 'cube' | 'gem') => void }) {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) return null

  return (
    <>
      <div className="title-overlay">
        <h1>Mixed Reality Playground</h1>
        <p>Where virtual objects meet your real world</p>
      </div>
      <div className="status-pill">
        <span>Ready</span> &middot; Desktop Preview
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
        <button className="xr-button spawn-ball" onClick={() => onSpawn('sphere')}>
          Sphere
        </button>
        <button className="xr-button spawn-box" onClick={() => onSpawn('cube')}>
          Cube
        </button>
        <button className="xr-button spawn-crystal" onClick={() => onSpawn('gem')}>
          Gem
        </button>
      </div>
    </>
  )
}

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  const [objects, setObjects] = useState<SpawnedObject[]>([])
  const countRef = useRef(0)

  const spawn = useCallback((type: 'sphere' | 'cube' | 'gem') => {
    const id = `obj-${countRef.current++}`
    const color = PALETTE[countRef.current % PALETTE.length]
    const x = (Math.random() - 0.5) * 1.2
    const z = -0.8 - Math.random() * 0.8
    const position: [number, number, number] = [x, 1.8, z]
    setObjects(prev => [...prev, { id, type, position, color }])
  }, [])

  return (
    <XRProvider
      features={['hand-tracking', 'plane-detection', 'hit-test', 'anchors', 'mesh-detection', 'local-floor']}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [1.2, 1.6, 2.2], fov: 55 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <XRContent objects={objects} onSpawn={spawn} />
        </Canvas>
        <UI onSpawn={spawn} />
      </div>
    </XRProvider>
  )
}
