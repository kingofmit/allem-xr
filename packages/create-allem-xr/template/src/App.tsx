import { useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel } from '@allem-xr/hands'
import type { Mesh } from 'three'

function SpinningBox() {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, 1.5, -1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={hovered ? '#ff6090' : '#6090ff'} />
    </mesh>
  )
}

function XRContent() {
  return (
    <XRScene>
      <XROrigin />
      <SpinningBox />
      <HandModel hand="left" color="#00ffaa" />
      <HandModel hand="right" color="#00aaff" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <gridHelper args={[10, 10, '#444444', '#222222']} />
    </XRScene>
  )
}

function EnterXRButton() {
  const { start, isActive, state } = useXRSession()
  const support = useXRSupport()

  if (support.isLoading) return null

  if (!support.isWebXRAvailable) {
    return (
      <div className="xr-button xr-unsupported">
        WebXR not available — use a VR/AR browser
      </div>
    )
  }

  if (isActive) {
    return null // hide button when in XR
  }

  return (
    <div className="xr-buttons">
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
  )
}

export default function App() {
  return (
    <XRProvider
      features={['hand-tracking', 'local-floor']}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas>
          <XRContent />
        </Canvas>
        <EnterXRButton />
      </div>
    </XRProvider>
  )
}
