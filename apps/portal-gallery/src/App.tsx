import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import { Portal, Guardian, SceneTransition, useSceneTransition } from '@allem-xr/portals'
import * as THREE from 'three'

function ForestScene() {
  return (
    <group>
      {/* Trees */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 3
        const z = Math.sin(angle) * 3
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 1, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 1.3, 0]}>
              <coneGeometry args={[0.5, 1, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        )
      })}
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2d5a1e" />
      </mesh>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} color="#ffffaa" />
    </group>
  )
}

function OceanScene() {
  return (
    <group>
      {/* Water plane */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#006994" transparent opacity={0.8} />
      </mesh>
      {/* Islands */}
      <mesh position={[2, 0.1, -2]}>
        <sphereGeometry args={[0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c2b280" />
      </mesh>
      <mesh position={[-3, 0.1, 1]}>
        <sphereGeometry args={[0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c2b280" />
      </mesh>
      {/* Sky color via fog */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, -3]} intensity={1} color="#fff5e0" />
    </group>
  )
}

function SpaceScene() {
  return (
    <group>
      {/* Stars */}
      {Array.from({ length: 200 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 20
        const y = (Math.random() - 0.5) * 20
        const z = (Math.random() - 0.5) * 20
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}
      {/* Planet */}
      <mesh position={[3, 2, -5]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#cc4444" roughness={0.8} />
      </mesh>
      {/* Nebula glow */}
      <pointLight position={[-3, 1, -3]} color="#4466ff" intensity={2} distance={10} />
      <ambientLight intensity={0.1} />
    </group>
  )
}

function XRContent() {
  const { isTransitioning } = useSceneTransition()

  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" color="#00ffaa" />
      <HandModel hand="right" color="#00aaff" />

      {/* Three portals */}
      <Portal
        position={[-2, 1.2, -3]}
        size={[1.2, 1.8]}
        borderColor="#22cc44"
        onEnter={() => console.log('Entered forest')}
      >
        <ForestScene />
      </Portal>

      <Portal
        position={[0, 1.2, -4]}
        size={[1.2, 1.8]}
        borderColor="#2288ff"
        onEnter={() => console.log('Entered ocean')}
      >
        <OceanScene />
      </Portal>

      <Portal
        position={[2, 1.2, -3]}
        size={[1.2, 1.8]}
        borderColor="#aa44ff"
        onEnter={() => console.log('Entered space')}
      >
        <SpaceScene />
      </Portal>

      {/* Guardian boundary */}
      <Guardian radius={4} color="#ff4444" fadeDistance={0.8} />

      {/* Scene transition overlay */}
      <SceneTransition active={isTransitioning} duration={600} color="#000000" />

      {/* Room lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 5, 3]} intensity={0.7} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffff" />

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[12, 24, '#333355', '#222244']} />

      {/* Desktop controls */}
      <OrbitControls target={[0, 1, -2]} />
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
        Portal Gallery — Walk through portals into different worlds
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
        <Canvas camera={{ position: [0, 2, 4], fov: 60 }} shadows>
          <XRContent />
        </Canvas>
        <UI />
      </div>
    </XRProvider>
  )
}
