import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import { usePlanes, PlaneOverlay } from '@allem-xr/spatial'
import { PhysicsWorld, RigidBody, RealWorldCollider, useHandPhysics } from '@allem-xr/physics'
import type { Vector3 } from 'three'

interface SpawnedObject {
  id: string
  type: 'ball' | 'box'
  position: [number, number, number]
  color: string
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#ff8a5c']

function PhysicsBall({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="ball" args={[0.15]} restitution={0.7} mass={0.5}>
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </RigidBody>
  )
}

function PhysicsBox({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="dynamic" position={position} collider="cuboid" args={[0.1, 0.1, 0.1]} restitution={0.3} mass={1}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
    </RigidBody>
  )
}

function HandPhysicsController() {
  useHandPhysics({ hand: 'left' })
  useHandPhysics({ hand: 'right' })
  return null
}

function PlaneColliders() {
  const { planes } = usePlanes({ filter: 'all' })
  return <RealWorldCollider source="planes" planes={planes} friction={0.8} restitution={0.3} />
}

function XRContent({ objects }: { objects: SpawnedObject[] }) {
  return (
    <XRScene>
      <XROrigin />

      {/* Hands (only visible in XR) */}
      <HandModel hand="left" color="#00ffaa" />
      <HandModel hand="right" color="#00aaff" />

      {/* Physics */}
      <PhysicsWorld gravity={[0, -9.81, 0]}>
        <HandPhysicsController />
        <PlaneColliders />

        {/* Spawned objects */}
        {objects.map(obj =>
          obj.type === 'ball' ? (
            <PhysicsBall key={obj.id} position={obj.position} color={obj.color} />
          ) : (
            <PhysicsBox key={obj.id} position={obj.position} color={obj.color} />
          )
        )}

        {/* Floor collider for non-AR (VR/desktop) */}
        <RigidBody type="fixed" position={[0, 0, 0]} collider="cuboid" args={[5, 0.005, 5]}>
          <mesh>
            <boxGeometry args={[10, 0.01, 10]} />
            <meshStandardMaterial color="#444444" transparent opacity={0.5} />
          </mesh>
        </RigidBody>
      </PhysicsWorld>

      {/* Plane visualization */}
      <PlaneOverlay filter="all" color="#00aaff" opacity={0.15} />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />

      {/* Grid for orientation */}
      <gridHelper args={[10, 20, '#555555', '#333333']} />

      {/* Desktop camera controls (disabled in XR) */}
      <OrbitControls target={[0, 0.5, 0]} />
    </XRScene>
  )
}

function UI({ onSpawn }: { onSpawn: (type: 'ball' | 'box') => void }) {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) return null

  return (
    <>
      <div className="info-text">
        Physics Playground — Spawn objects and watch them interact with your real world
      </div>
      <div className="ui-overlay">
        {support.ar && (
          <button className="xr-button" onClick={() => start('immersive-ar')}>
            Enter AR
          </button>
        )}
        {support.vr && (
          <button className="xr-button" onClick={() => start('immersive-vr')}>
            Enter VR
          </button>
        )}
        <button className="xr-button spawn-button" onClick={() => onSpawn('ball')}>
          Spawn Ball
        </button>
        <button className="xr-button spawn-button" onClick={() => onSpawn('box')}>
          Spawn Box
        </button>
      </div>
    </>
  )
}

export default function App() {
  const [objects, setObjects] = useState<SpawnedObject[]>([])
  const countRef = useRef(0)

  const spawn = useCallback((type: 'ball' | 'box') => {
    const id = `obj-${countRef.current++}`
    const color = COLORS[countRef.current % COLORS.length]
    // Spawn in view of the default camera
    const x = (Math.random() - 0.5) * 1.5
    const z = (Math.random() - 0.5) * 1.5
    const position: [number, number, number] = [x, 2, z]

    setObjects(prev => [...prev, { id, type, position, color }])
  }, [])

  return (
    <XRProvider
      features={['hand-tracking', 'plane-detection', 'hit-test', 'local-floor']}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas shadows camera={{ position: [2, 2, 3], fov: 60 }}>
          <XRContent objects={objects} />
        </Canvas>
        <UI onSpawn={spawn} />
      </div>
    </XRProvider>
  )
}
