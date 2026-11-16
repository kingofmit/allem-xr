import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel, useHands } from '@allem-xr/hands'
import { AvatarMirror } from '@allem-xr/avatars'
import { useAudioListener } from '@allem-xr/audio'
import * as THREE from 'three'

function SimpleAvatar() {
  const groupRef = useRef<THREE.Group>(null)

  // Gentle idle animation on desktop
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    // Subtle breathing motion
    groupRef.current.position.y = 0.8 + Math.sin(t * 1.5) * 0.01
  })

  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color="#4488cc" />
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.3, 0.2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.3, 0.2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
    </group>
  )
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-3, 1.5, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#353545" />
      </mesh>
      {/* Right wall */}
      <mesh position={[3, 1.5, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#353545" />
      </mesh>
      {/* Ceiling light */}
      <mesh position={[0, 2.95, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function AudioSetup() {
  useAudioListener()
  return null
}

function XRContent() {
  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" color="#00ffaa" opacity={0.6} />
      <HandModel hand="right" color="#00aaff" opacity={0.6} />

      {/* Simple avatar */}
      <SimpleAvatar />

      {/* Mirror on back wall */}
      <AvatarMirror
        position={[0, 1.5, -2.9]}
        width={1.5}
        height={2}
        resolution={512}
      />

      {/* Mirror frame */}
      <mesh position={[0, 1.5, -2.89]}>
        <planeGeometry args={[1.6, 2.1]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Room */}
      <Room />

      {/* Audio listener synced to camera */}
      <AudioSetup />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2.8, 0]} intensity={1.5} castShadow />
      <pointLight position={[-2, 2, 1]} intensity={0.3} color="#6688ff" />
      <pointLight position={[2, 2, 1]} intensity={0.3} color="#ff8866" />

      {/* Desktop controls */}
      <OrbitControls target={[0, 1.2, -1]} />
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
        Avatar Mirror — See yourself in VR. Hand tracking drives your avatar.
      </div>
      <div className="ui-overlay">
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
        <Canvas camera={{ position: [0, 1.6, 2], fov: 60 }} shadows>
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
