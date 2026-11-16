import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Text, OrbitControls } from '@react-three/drei'
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'
import { HandModel, useGesture } from '@allem-xr/hands'
import { useHitTest, usePlanes, PlaneOverlay, useAnchor } from '@allem-xr/spatial'
import * as THREE from 'three'

interface StickyNote {
  id: string
  position: [number, number, number]
  rotation: [number, number, number, number]
  color: string
  text: string
}

const NOTE_COLORS = ['#fff176', '#aed581', '#4fc3f7', '#f48fb1', '#ce93d8', '#ffab91']
const NOTE_TEXTS = ['Todo', 'Idea', 'Note', 'Remember', 'Check', 'Review']

function StickyNoteModel({ note }: { note: StickyNote }) {
  return (
    <group
      position={note.position}
      quaternion={new THREE.Quaternion(note.rotation[0], note.rotation[1], note.rotation[2], note.rotation[3])}
    >
      {/* Note background */}
      <mesh>
        <planeGeometry args={[0.08, 0.08]} />
        <meshStandardMaterial
          color={note.color}
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      {/* Note text */}
      <Text
        position={[0, 0, 0.001]}
        fontSize={0.015}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.07}
      >
        {note.text}
      </Text>
      {/* Shadow/depth */}
      <mesh position={[0.002, -0.002, -0.001]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshBasicMaterial color="#00000033" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function PlacementPreview() {
  const { results } = useHitTest({ source: 'viewer' })
  const groupRef = useRef<THREE.Group>(null)

  // Update preview position
  if (groupRef.current) {
    if (results.length > 0) {
      const hit = results[0]
      groupRef.current.visible = true
      groupRef.current.position.copy(hit.position)
      groupRef.current.quaternion.copy(hit.rotation)
    } else {
      groupRef.current.visible = false
    }
  }

  return (
    <group ref={groupRef}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.02, 0.03, 32]} />
        <meshBasicMaterial color="#00ffaa" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function NoteCreator({ onCreateNote }: { onCreateNote: (note: StickyNote) => void }) {
  const { results } = useHitTest({ source: 'viewer' })
  const pinch = useGesture('pinch', { hand: 'right' })
  const prevPinchRef = useRef(false)
  const noteCountRef = useRef(0)
  const onCreateNoteRef = useRef(onCreateNote)
  onCreateNoteRef.current = onCreateNote

  // Detect pinch start → create note at hit test position
  useEffect(() => {
    if (pinch.active && !prevPinchRef.current && results.length > 0) {
      const hit = results[0]
      const id = `note-${noteCountRef.current++}`
      const color = NOTE_COLORS[noteCountRef.current % NOTE_COLORS.length]
      const text = NOTE_TEXTS[noteCountRef.current % NOTE_TEXTS.length]

      onCreateNoteRef.current({
        id,
        position: [hit.position.x, hit.position.y, hit.position.z],
        rotation: [hit.rotation.x, hit.rotation.y, hit.rotation.z, hit.rotation.w],
        color,
        text,
      })
    }
    prevPinchRef.current = pinch.active
  }, [pinch.active, results])

  return null
}

function XRContent({ notes, onCreateNote }: {
  notes: StickyNote[]
  onCreateNote: (note: StickyNote) => void
}) {
  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" color="#00ffaa" opacity={0.6} />
      <HandModel hand="right" color="#00aaff" opacity={0.6} />

      {/* Hit test preview */}
      <PlacementPreview />

      {/* Note creator (listens for pinch) */}
      <NoteCreator onCreateNote={onCreateNote} />

      {/* Rendered notes */}
      {notes.map(note => (
        <StickyNoteModel key={note.id} note={note} />
      ))}

      {/* Plane visualization */}
      <PlaneOverlay filter="all" color="#ffffff" opacity={0.05} />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 5, 3]} intensity={0.6} />

      {/* Desktop: grid + orbit controls */}
      <gridHelper args={[10, 20, '#444444', '#222222']} />
      <OrbitControls target={[0, 1, 0]} />
    </XRScene>
  )
}

function UI({ noteCount }: { noteCount: number }) {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) {
    return (
      <div className="note-count">
        {noteCount} note{noteCount !== 1 ? 's' : ''} placed
      </div>
    )
  }

  return (
    <>
      <div className="info-text">
        Spatial Notes — Place sticky notes on real surfaces with a pinch gesture
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
  const [notes, setNotes] = useState<StickyNote[]>([])

  const handleCreateNote = useCallback((note: StickyNote) => {
    setNotes(prev => [...prev, note])
  }, [])

  return (
    <XRProvider
      features={['hand-tracking', 'hit-test', 'plane-detection', 'anchors', 'local-floor']}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas camera={{ position: [0, 1.5, 3], fov: 60 }}>
          <XRContent notes={notes} onCreateNote={handleCreateNote} />
        </Canvas>
        <UI noteCount={notes.length} />
      </div>
    </XRProvider>
  )
}
