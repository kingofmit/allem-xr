import { useState, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Core
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'

// Hands
import { HandModel, HandRay, useGesture } from '@allem-xr/hands'

// Spatial
import { usePlanes, PlaneOverlay, useHitTest } from '@allem-xr/spatial'

// Physics
import { PhysicsWorld, RigidBody, RealWorldCollider, useHandPhysics, useGravity } from '@allem-xr/physics'

// UI
import { UIProvider, Panel, Button, Text, Slider, Toggle, ProgressBar, GazePointer } from '@allem-xr/ui'

// Audio
import { useAudioListener } from '@allem-xr/audio'

// Portals
import { Portal, Guardian, SceneTransition, useSceneTransition } from '@allem-xr/portals'

// ============================================================
// CARTOON WORLD (inside the portal)
// ============================================================

function CartoonWorld() {
  return (
    <group>
      {/* Colorful ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#7ec850" />
      </mesh>

      {/* Mushrooms */}
      {[[-1, 0, -1], [1.5, 0, -0.5], [-0.5, 0, -2], [2, 0, -1.5]].map(([x, y, z], i) => (
        <group key={`mush-${i}`} position={[x, y, z]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={['#ff4444', '#ff8844', '#ff44aa', '#ffaa44'][i]} />
          </mesh>
          {/* White dots on cap */}
          {[0, 1, 2, 3].map(j => {
            const a = (j / 4) * Math.PI * 2
            return (
              <mesh key={j} position={[Math.cos(a) * 0.07, 0.38, Math.sin(a) * 0.07]}>
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Floating crystals */}
      {[[-0.8, 0.8, -1.5], [1, 1.2, -1], [0, 0.6, -2.5]].map(([x, y, z], i) => (
        <FloatingCrystal key={`crystal-${i}`} position={[x, y, z]} color={['#44ddff', '#ff44dd', '#ddff44'][i]} />
      ))}

      {/* Trees */}
      {[[2.5, 0, -2], [-2, 0, -1.5], [0, 0, -3]].map(([x, y, z], i) => (
        <group key={`tree-${i}`} position={[x, y, z]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 0.8, 8]} />
            <meshStandardMaterial color="#8B5A2B" />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#44aa33" />
          </mesh>
        </group>
      ))}

      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} color="#fff8e0" />
      <pointLight position={[0, 2, -1]} intensity={0.5} color="#aaeeff" />
    </group>
  )
}

function FloatingCrystal({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.1
    ref.current.rotation.y = t * 0.5
  })

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.2} metalness={0.8} />
    </mesh>
  )
}

// ============================================================
// PHYSICS OBJECTS (can be spawned and interact with real world)
// ============================================================

interface SpawnedObject {
  id: string
  type: 'ball' | 'box' | 'crystal'
  position: [number, number, number]
  color: string
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff8a5c', '#44ddff', '#ff44dd']

function PhysicsBall({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="ball" args={[0.08]} restitution={0.8} mass={0.3}>
      <mesh castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
      </mesh>
    </RigidBody>
  )
}

function PhysicsBox({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="cuboid" args={[0.06, 0.06, 0.06]} restitution={0.4} mass={0.5}>
      <mesh castShadow>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </RigidBody>
  )
}

function PhysicsCrystal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="ball" args={[0.06]} restitution={0.9} mass={0.2}>
      <mesh castShadow>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.1} metalness={0.9} />
      </mesh>
    </RigidBody>
  )
}

// ============================================================
// HAND PHYSICS CONTROLLER
// ============================================================

function HandPhysicsController() {
  useHandPhysics({ hand: 'left' })
  useHandPhysics({ hand: 'right' })
  return null
}

// ============================================================
// REAL WORLD COLLIDERS (from detected planes)
// ============================================================

function WorldColliders() {
  const { planes } = usePlanes({ filter: 'all' })
  return <RealWorldCollider source="planes" planes={planes} friction={0.7} restitution={0.3} />
}

// ============================================================
// CONTROL PANEL (spatial UI)
// ============================================================

function ControlPanel({ onSpawn, objectCount }: {
  onSpawn: (type: 'ball' | 'box' | 'crystal') => void
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
      position={[0.6, 1.5, -0.8]}
      width={0.4}
      height={0.5}
      backgroundColor="#0a0a1a"
      backgroundOpacity={0.92}
    >
      {/* Title */}
      <Text position={[-0.16, 0.2, 0]} fontSize={0.022} color="#ffffff" bold>
        Control Panel
      </Text>

      {/* Spawn buttons */}
      <Text position={[-0.16, 0.15, 0]} fontSize={0.011} color="#888888">
        Spawn Objects
      </Text>
      <Button
        position={[-0.12, 0.1, 0]}
        width={0.08}
        height={0.03}
        color="#cc3333"
        hoverColor="#ff4444"
        fontSize={0.011}
        onSelect={() => onSpawn('ball')}
      >
        Ball
      </Button>
      <Button
        position={[0, 0.1, 0]}
        width={0.08}
        height={0.03}
        color="#3333cc"
        hoverColor="#4444ff"
        fontSize={0.011}
        onSelect={() => onSpawn('box')}
      >
        Box
      </Button>
      <Button
        position={[0.12, 0.1, 0]}
        width={0.08}
        height={0.03}
        color="#cc33cc"
        hoverColor="#ff44ff"
        fontSize={0.011}
        onSelect={() => onSpawn('crystal')}
      >
        Crystal
      </Button>

      {/* Gravity slider */}
      <Slider
        position={[-0.16, 0.03, 0]}
        value={gravityStrength}
        onChange={handleGravityChange}
        min={0}
        max={2}
        step={0.1}
        width={0.3}
        label="Gravity"
      />

      {/* Show planes toggle */}
      <Toggle
        position={[-0.16, -0.05, 0]}
        checked={showPlanes}
        onChange={setShowPlanes}
        label="Show Planes"
      />

      {/* Object count */}
      <ProgressBar
        position={[-0.16, -0.12, 0]}
        value={Math.min(1, objectCount / 30)}
        width={0.3}
        label={`Objects: ${objectCount}`}
        color="#44cc88"
      />

      {/* Gesture hint */}
      <Text position={[-0.16, -0.19, 0]} fontSize={0.009} color="#555555" maxWidth={0.35}>
        Pinch to grab objects. Open palm to push. Point to aim.
      </Text>
    </Panel>
  )
}

// ============================================================
// AUDIO SETUP
// ============================================================

function AudioSetup() {
  useAudioListener()
  return null
}

// ============================================================
// GESTURE FEEDBACK (visual indicators)
// ============================================================

function GestureFeedback() {
  const rightPinch = useGesture('pinch', { hand: 'right' })
  const leftPinch = useGesture('pinch', { hand: 'left' })

  return (
    <>
      {/* Pinch indicators — glow spheres at pinch point */}
      {rightPinch.active && rightPinch.position && (
        <mesh position={rightPinch.position}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#00ffaa" transparent opacity={0.6} />
        </mesh>
      )}
      {leftPinch.active && leftPinch.position && (
        <mesh position={leftPinch.position}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.6} />
        </mesh>
      )}
    </>
  )
}

// ============================================================
// MAIN XR CONTENT
// ============================================================

function XRContent({ objects, onSpawn }: {
  objects: SpawnedObject[]
  onSpawn: (type: 'ball' | 'box' | 'crystal') => void
}) {
  const { planes } = usePlanes({ filter: 'all' })

  return (
    <XRScene>
      <XROrigin />

      {/* === HANDS === */}
      <HandModel hand="left" model="spheres" color="#00ffaa" opacity={0.7} />
      <HandModel hand="right" model="spheres" color="#00aaff" opacity={0.7} />
      <HandRay hand="right" color="#00aaff" opacity={0.2} maxLength={5} />

      {/* === PORTAL === */}
      <Portal
        position={[0, 1, -2.5]}
        rotation={[0, 0, 0]}
        size={[1.4, 2]}
        borderColor="#44ddff"
        borderWidth={0.025}
        onEnter={() => console.log('Entered cartoon world!')}
      >
        <CartoonWorld />
      </Portal>

      {/* === PHYSICS === */}
      <PhysicsWorld gravity={[0, -9.81, 0]}>
        <HandPhysicsController />
        <WorldColliders />

        {/* Spawned objects */}
        {objects.map(obj => {
          switch (obj.type) {
            case 'ball': return <PhysicsBall key={obj.id} position={obj.position} color={obj.color} />
            case 'box': return <PhysicsBox key={obj.id} position={obj.position} color={obj.color} />
            case 'crystal': return <PhysicsCrystal key={obj.id} position={obj.position} color={obj.color} />
          }
        })}

        {/* Invisible floor for desktop / non-AR */}
        <RigidBody type="fixed" position={[0, -0.01, 0]} collider="cuboid" args={[5, 0.01, 5]}>
          <mesh>
            <boxGeometry args={[10, 0.02, 10]} />
            <meshStandardMaterial color="#222222" transparent opacity={0.15} />
          </mesh>
        </RigidBody>

        {/* === SPATIAL UI (inside PhysicsWorld for gravity control) === */}
        <UIProvider>
          <GazePointer size={0.004} color="#ffffff" />
          <ControlPanel onSpawn={onSpawn} objectCount={objects.length} />
        </UIProvider>
      </PhysicsWorld>

      {/* === PLANE VISUALIZATION === */}
      <PlaneOverlay filter="all" color="#00aaff" opacity={0.08} />

      {/* === GESTURE FEEDBACK === */}
      <GestureFeedback />

      {/* === GUARDIAN === */}
      <Guardian radius={3} color="#ff4444" fadeDistance={0.6} />

      {/* === AUDIO === */}
      <AudioSetup />

      {/* === LIGHTING === */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 3]} intensity={0.8} castShadow />
      <pointLight position={[-2, 3, 1]} intensity={0.3} color="#4488ff" />
      <pointLight position={[2, 3, -1]} intensity={0.3} color="#ff8844" />

      {/* === ENVIRONMENT === */}
      <gridHelper args={[10, 20, '#333344', '#222233']} />

      {/* Desktop orbit controls */}
      <OrbitControls target={[0, 1, -1]} />
    </XRScene>
  )
}

// ============================================================
// HTML UI OVERLAY
// ============================================================

function UI({ onSpawn }: { onSpawn: (type: 'ball' | 'box' | 'crystal') => void }) {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) return null

  return (
    <>
      <div className="title-overlay">
        <h1>Mixed Reality Playground</h1>
        <p>Where virtual objects meet your real world</p>
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
        <button className="xr-button" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }} onClick={() => onSpawn('ball')}>
          Spawn Ball
        </button>
        <button className="xr-button" style={{ background: 'linear-gradient(135deg, #4d96ff, #3333cc)' }} onClick={() => onSpawn('box')}>
          Spawn Box
        </button>
        <button className="xr-button" style={{ background: 'linear-gradient(135deg, #ff44dd, #9b59b6)' }} onClick={() => onSpawn('crystal')}>
          Spawn Crystal
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

  const spawn = useCallback((type: 'ball' | 'box' | 'crystal') => {
    const id = `obj-${countRef.current++}`
    const color = COLORS[countRef.current % COLORS.length]
    // Spawn in front and above, slightly random
    const x = (Math.random() - 0.5) * 1.5
    const z = -1 - Math.random() * 1
    const position: [number, number, number] = [x, 2, z]
    setObjects(prev => [...prev, { id, type, position, color }])
  }, [])

  return (
    <XRProvider
      features={[
        'hand-tracking',
        'plane-detection',
        'hit-test',
        'anchors',
        'mesh-detection',
        'local-floor',
      ]}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [1.5, 1.8, 2.5], fov: 60 }}
          shadows
        >
          <XRContent objects={objects} onSpawn={spawn} />
        </Canvas>
        <UI onSpawn={spawn} />
      </div>
    </XRProvider>
  )
}
