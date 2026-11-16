import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel, HandRay, useGesture } from '@allem-xr/hands'
import { Panel, Text } from '@allem-xr/ui'

function GestureIndicator({ name, hand }: { name: 'pinch' | 'grab' | 'point' | 'fist' | 'open-palm'; hand: 'left' | 'right' }) {
  const gesture = useGesture(name, { hand })
  const color = gesture.active ? '#44ff44' : '#444444'

  return (
    <group>
      {/* Status dot */}
      <mesh>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Label */}
      <Text position={[0.02, 0, 0]} fontSize={0.012} color={color}>
        {name}
      </Text>
    </group>
  )
}

function GesturePanel({ hand, xOffset }: { hand: 'left' | 'right'; xOffset: number }) {
  const gestures: Array<'pinch' | 'grab' | 'point' | 'fist' | 'open-palm'> = [
    'pinch', 'grab', 'point', 'fist', 'open-palm'
  ]

  return (
    <Panel
      position={[xOffset, 1.8, -1.2]}
      width={0.25}
      height={0.28}
      backgroundColor="#111122"
      backgroundOpacity={0.9}
    >
      <Text position={[-0.1, 0.1, 0]} fontSize={0.02} color="#ffffff" bold>
        {hand === 'left' ? 'Left Hand' : 'Right Hand'}
      </Text>
      {gestures.map((name, i) => (
        <group key={name} position={[-0.08, 0.06 - i * 0.035, 0.001]}>
          <GestureIndicator name={name} hand={hand} />
        </group>
      ))}
    </Panel>
  )
}

function XRContent() {
  return (
    <XRScene>
      <XROrigin />

      {/* Hand models with skeleton */}
      <HandModel hand="left" model="spheres" color="#00ffaa" opacity={0.8} />
      <HandModel hand="right" model="spheres" color="#00aaff" opacity={0.8} />

      {/* Hand rays for pointing */}
      <HandRay hand="left" color="#00ffaa" opacity={0.3} maxLength={3} />
      <HandRay hand="right" color="#00aaff" opacity={0.3} maxLength={3} />

      {/* Gesture status panels */}
      <GesturePanel hand="left" xOffset={-0.4} />
      <GesturePanel hand="right" xOffset={0.4} />

      {/* Info panel */}
      <Panel
        position={[0, 1.4, -1.5]}
        width={0.5}
        height={0.12}
        backgroundColor="#112233"
        backgroundOpacity={0.85}
      >
        <Text position={[-0.2, 0.03, 0]} fontSize={0.018} color="#ffffff" bold>
          Gesture Lab
        </Text>
        <Text position={[-0.2, -0.02, 0]} fontSize={0.011} color="#888888" maxWidth={0.45}>
          Try pinching, grabbing, pointing, making a fist, or opening your palm. Gesture indicators light up green when detected.
        </Text>
      </Panel>

      {/* Interactive target objects */}
      {[[-1, 1, -2], [0, 0.8, -2.5], [1, 1.2, -2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial
            color={['#ff6b6b', '#ffd93d', '#6bcb77'][i]}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Environment */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 3]} intensity={0.7} />
      <gridHelper args={[10, 20, '#333', '#222']} />

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Desktop controls */}
      <OrbitControls target={[0, 1.3, -1.5]} />
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
        Gesture Lab — Hand tracking with real-time gesture detection
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
        <Canvas camera={{ position: [0, 1.6, 1.5], fov: 60 }}>
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
