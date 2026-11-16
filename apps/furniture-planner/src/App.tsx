import { useState, useCallback, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// Core
import { XRProvider, XRScene, XROrigin, useXRSession, useXRSupport } from '@allem-xr/core'

// Hands
import { HandModel, HandRay, useGesture } from '@allem-xr/hands'

// Spatial
import { usePlanes, PlaneOverlay, useHitTest } from '@allem-xr/spatial'

// Physics
import { PhysicsWorld, RigidBody } from '@allem-xr/physics'

// UI
import { UIProvider, Panel, Button, Text, Toggle, ProgressBar, GazePointer } from '@allem-xr/ui'

// Audio
import { useAudioListener } from '@allem-xr/audio'

// ================================================================
// FURNITURE CATALOG
// ================================================================

interface FurnitureItem {
  id: string
  name: string
  category: 'seating' | 'tables' | 'storage' | 'decor'
  color: string
  accentColor: string
  dimensions: [number, number, number] // width, height, depth in meters
  price: number
}

const CATALOG: FurnitureItem[] = [
  { id: 'sofa', name: 'Modern Sofa', category: 'seating', color: '#4a5568', accentColor: '#2d3748', dimensions: [1.8, 0.8, 0.85], price: 1299 },
  { id: 'armchair', name: 'Accent Chair', category: 'seating', color: '#c05621', accentColor: '#9c4221', dimensions: [0.75, 0.85, 0.8], price: 599 },
  { id: 'coffee-table', name: 'Coffee Table', category: 'tables', color: '#744210', accentColor: '#5a3510', dimensions: [1.1, 0.4, 0.6], price: 449 },
  { id: 'dining-table', name: 'Dining Table', category: 'tables', color: '#553c2e', accentColor: '#3d2b20', dimensions: [1.6, 0.75, 0.9], price: 899 },
  { id: 'bookshelf', name: 'Bookshelf', category: 'storage', color: '#2c5282', accentColor: '#1a365d', dimensions: [0.8, 1.8, 0.35], price: 349 },
  { id: 'sideboard', name: 'Sideboard', category: 'storage', color: '#285e61', accentColor: '#1a4a4d', dimensions: [1.4, 0.75, 0.4], price: 749 },
  { id: 'floor-lamp', name: 'Floor Lamp', category: 'decor', color: '#b7791f', accentColor: '#975a16', dimensions: [0.3, 1.6, 0.3], price: 199 },
  { id: 'plant', name: 'Potted Plant', category: 'decor', color: '#276749', accentColor: '#1a4731', dimensions: [0.4, 0.9, 0.4], price: 89 },
]

// ================================================================
// PROCEDURAL FURNITURE MODELS
// ================================================================

function FurnitureModel({ item, selected }: { item: FurnitureItem; selected?: boolean }) {
  const [w, h, d] = item.dimensions

  const selectionGlow = selected ? 0.08 : 0

  switch (item.id) {
    case 'sofa':
      return (
        <group>
          {/* Base/seat */}
          <mesh position={[0, h * 0.25, 0]} castShadow>
            <boxGeometry args={[w, h * 0.35, d]} />
            <meshPhysicalMaterial color={item.color} roughness={0.8} metalness={0.05} emissive={item.color} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Back */}
          <mesh position={[0, h * 0.55, -d * 0.35]} castShadow>
            <boxGeometry args={[w, h * 0.5, d * 0.2]} />
            <meshPhysicalMaterial color={item.accentColor} roughness={0.75} metalness={0.05} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-w * 0.45, h * 0.35, 0]} castShadow>
            <boxGeometry args={[w * 0.08, h * 0.3, d * 0.8]} />
            <meshPhysicalMaterial color={item.accentColor} roughness={0.75} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
          </mesh>
          <mesh position={[w * 0.45, h * 0.35, 0]} castShadow>
            <boxGeometry args={[w * 0.08, h * 0.3, d * 0.8]} />
            <meshPhysicalMaterial color={item.accentColor} roughness={0.75} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Legs */}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx * w * 0.4, 0.04, lz * d * 0.35]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
              <meshPhysicalMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
          {/* Cushions */}
          {[-0.3, 0.3].map((cx, i) => (
            <mesh key={`c${i}`} position={[cx, h * 0.42, 0.05]} castShadow>
              <boxGeometry args={[w * 0.4, h * 0.1, d * 0.65]} />
              <meshPhysicalMaterial color={item.color} roughness={0.9} clearcoat={0.1} emissive={item.color} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
        </group>
      )

    case 'armchair':
      return (
        <group>
          <mesh position={[0, h * 0.25, 0]} castShadow>
            <boxGeometry args={[w, h * 0.35, d]} />
            <meshPhysicalMaterial color={item.color} roughness={0.85} emissive={item.color} emissiveIntensity={selectionGlow} />
          </mesh>
          <mesh position={[0, h * 0.55, -d * 0.35]} castShadow>
            <boxGeometry args={[w * 0.9, h * 0.45, d * 0.2]} />
            <meshPhysicalMaterial color={item.accentColor} roughness={0.8} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
          </mesh>
          {[[-1,1],[1,1]].map(([ax], i) => (
            <mesh key={i} position={[ax * w * 0.42, h * 0.35, 0]} castShadow>
              <boxGeometry args={[w * 0.1, h * 0.25, d * 0.75]} />
              <meshPhysicalMaterial color={item.accentColor} roughness={0.8} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([lx,lz], i) => (
            <mesh key={`l${i}`} position={[lx * w * 0.3, 0.035, lz * d * 0.3]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.07, 8]} />
              <meshPhysicalMaterial color="#2d2d2d" roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
        </group>
      )

    case 'coffee-table':
    case 'dining-table':
      return (
        <group>
          {/* Tabletop */}
          <mesh position={[0, h - 0.025, 0]} castShadow>
            <boxGeometry args={[w, 0.05, d]} />
            <meshPhysicalMaterial color={item.color} roughness={0.4} metalness={0.1} clearcoat={0.5} clearcoatRoughness={0.1} emissive={item.color} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Legs */}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([lx,lz], i) => (
            <mesh key={i} position={[lx * (w * 0.42), (h - 0.05) / 2, lz * (d * 0.42)]} castShadow>
              <cylinderGeometry args={[0.025, 0.03, h - 0.05, 8]} />
              <meshPhysicalMaterial color={item.accentColor} roughness={0.5} metalness={0.3} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
        </group>
      )

    case 'bookshelf':
      return (
        <group>
          {/* Sides */}
          {[-1, 1].map((sx, i) => (
            <mesh key={i} position={[sx * w * 0.47, h / 2, 0]} castShadow>
              <boxGeometry args={[0.025, h, d]} />
              <meshPhysicalMaterial color={item.color} roughness={0.6} metalness={0.1} emissive={item.color} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
          {/* Shelves */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((sy, i) => (
            <mesh key={`s${i}`} position={[0, sy * h, 0]} castShadow>
              <boxGeometry args={[w, 0.02, d]} />
              <meshPhysicalMaterial color={item.accentColor} roughness={0.5} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
          {/* Back panel */}
          <mesh position={[0, h / 2, -d * 0.47]}>
            <boxGeometry args={[w * 0.92, h * 0.98, 0.01]} />
            <meshPhysicalMaterial color={item.accentColor} roughness={0.7} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
          </mesh>
        </group>
      )

    case 'sideboard':
      return (
        <group>
          <mesh position={[0, h * 0.5, 0]} castShadow>
            <boxGeometry args={[w, h * 0.85, d]} />
            <meshPhysicalMaterial color={item.color} roughness={0.5} metalness={0.15} clearcoat={0.3} emissive={item.color} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Doors */}
          {[-0.25, 0.25].map((dx, i) => (
            <mesh key={i} position={[dx * w, h * 0.5, d * 0.501]} castShadow>
              <boxGeometry args={[w * 0.45, h * 0.75, 0.015]} />
              <meshPhysicalMaterial color={item.accentColor} roughness={0.4} metalness={0.2} emissive={item.accentColor} emissiveIntensity={selectionGlow} />
            </mesh>
          ))}
          {/* Handles */}
          {[-0.08, 0.08].map((hx, i) => (
            <mesh key={`h${i}`} position={[hx * w, h * 0.5, d * 0.52]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
              <meshPhysicalMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} />
            </mesh>
          ))}
          {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([lx,lz], i) => (
            <mesh key={`l${i}`} position={[lx * w * 0.42, 0.04, lz * d * 0.35]}>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
              <meshPhysicalMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
        </group>
      )

    case 'floor-lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.04, 16]} />
            <meshPhysicalMaterial color="#2d2d2d" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, h * 0.85, 8]} />
            <meshPhysicalMaterial color={item.color} roughness={0.3} metalness={0.8} emissive={item.color} emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Shade */}
          <mesh position={[0, h * 0.88, 0]}>
            <cylinderGeometry args={[0.08, 0.14, 0.2, 16, 1, true]} />
            <meshPhysicalMaterial color="#f5f0e8" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.85} emissive="#fff5e0" emissiveIntensity={0.15 + selectionGlow} />
          </mesh>
          {/* Bulb glow */}
          <pointLight position={[0, h * 0.85, 0]} color="#fff5e0" intensity={0.3} distance={2} />
        </group>
      )

    case 'plant':
      return (
        <group>
          {/* Pot */}
          <mesh position={[0, h * 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, h * 0.3, 12]} />
            <meshPhysicalMaterial color="#8b6914" roughness={0.8} emissive="#8b6914" emissiveIntensity={selectionGlow} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, h * 0.3, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
            <meshPhysicalMaterial color="#3d2b1f" roughness={0.95} />
          </mesh>
          {/* Foliage spheres */}
          {[[0, 0.6, 0], [-0.08, 0.5, 0.06], [0.07, 0.55, -0.05], [0, 0.7, 0.03], [-0.05, 0.65, -0.04]].map(([x, yf, z], i) => (
            <mesh key={i} position={[x, h * yf, z]} castShadow>
              <sphereGeometry args={[0.07 + Math.random() * 0.04, 12, 12]} />
              <meshPhysicalMaterial color={item.color} roughness={0.7} emissive={item.color} emissiveIntensity={selectionGlow * 0.5} />
            </mesh>
          ))}
        </group>
      )

    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshPhysicalMaterial color={item.color} roughness={0.5} emissive={item.color} emissiveIntensity={selectionGlow} />
        </mesh>
      )
  }
}

// ================================================================
// PLACED FURNITURE (in the room)
// ================================================================

interface PlacedFurniture {
  id: string
  catalogId: string
  position: [number, number, number]
  rotation: number // Y rotation in radians
}

function PlacedItem({ placed, catalogItem, isSelected, onSelect }: {
  placed: PlacedFurniture
  catalogItem: FurnitureItem
  isSelected: boolean
  onSelect: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group
      ref={groupRef}
      position={placed.position}
      rotation-y={placed.rotation}
      onClick={onSelect}
    >
      <FurnitureModel item={catalogItem} selected={isSelected} />

      {/* Selection indicator ring */}
      {isSelected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
          <ringGeometry args={[
            Math.max(catalogItem.dimensions[0], catalogItem.dimensions[2]) * 0.55,
            Math.max(catalogItem.dimensions[0], catalogItem.dimensions[2]) * 0.6,
            32
          ]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// ================================================================
// CATALOG PANEL (spatial UI)
// ================================================================

function CatalogPanel({ onPlace, budget, spent }: {
  onPlace: (item: FurnitureItem) => void
  budget: number
  spent: number
}) {
  const [category, setCategory] = useState<string>('all')

  const filtered = category === 'all'
    ? CATALOG
    : CATALOG.filter(item => item.category === category)

  return (
    <Panel
      position={[-0.65, 1.5, -0.6]}
      width={0.42}
      height={0.58}
      backgroundColor="#0a0e1a"
      backgroundOpacity={0.9}
    >
      <Text position={[-0.17, 0.25, 0]} fontSize={0.018} color="#e0e7ff" bold>
        Furniture Catalog
      </Text>

      {/* Category filters */}
      <Button position={[-0.15, 0.2, 0]} width={0.065} height={0.022} fontSize={0.008}
        color={category === 'all' ? '#312e81' : '#1e1b4b'} hoverColor="#4338ca"
        onSelect={() => setCategory('all')}>All</Button>
      <Button position={[-0.075, 0.2, 0]} width={0.065} height={0.022} fontSize={0.008}
        color={category === 'seating' ? '#312e81' : '#1e1b4b'} hoverColor="#4338ca"
        onSelect={() => setCategory('seating')}>Seats</Button>
      <Button position={[0, 0.2, 0]} width={0.065} height={0.022} fontSize={0.008}
        color={category === 'tables' ? '#312e81' : '#1e1b4b'} hoverColor="#4338ca"
        onSelect={() => setCategory('tables')}>Tables</Button>
      <Button position={[0.075, 0.2, 0]} width={0.065} height={0.022} fontSize={0.008}
        color={category === 'storage' ? '#312e81' : '#1e1b4b'} hoverColor="#4338ca"
        onSelect={() => setCategory('storage')}>Storage</Button>

      {/* Item list */}
      {filtered.slice(0, 6).map((item, i) => (
        <group key={item.id} position={[0, 0.14 - i * 0.055, 0]}>
          {/* Color swatch */}
          <mesh position={[-0.15, 0, 0.001]}>
            <planeGeometry args={[0.025, 0.025]} />
            <meshBasicMaterial color={item.color} />
          </mesh>
          {/* Name */}
          <Text position={[-0.13, 0.005, 0]} fontSize={0.01} color="#c7d2fe">
            {item.name}
          </Text>
          {/* Dimensions */}
          <Text position={[-0.13, -0.01, 0]} fontSize={0.007} color="#64748b">
            {`${(item.dimensions[0] * 100).toFixed(0)}x${(item.dimensions[2] * 100).toFixed(0)}cm — $${item.price}`}
          </Text>
          {/* Place button */}
          <Button
            position={[0.14, 0, 0]}
            width={0.055}
            height={0.022}
            fontSize={0.008}
            color="#1e3a2f"
            hoverColor="#22543d"
            onSelect={() => onPlace(item)}
          >
            Place
          </Button>
        </group>
      ))}

      {/* Budget tracker */}
      <ProgressBar
        position={[-0.17, -0.22, 0]}
        value={Math.min(1, spent / budget)}
        width={0.32}
        label={`Budget: $${spent.toLocaleString()} / $${budget.toLocaleString()}`}
        color={spent > budget ? '#ef4444' : '#34d399'}
        trackColor="#1e293b"
      />
    </Panel>
  )
}

// ================================================================
// ROOM INFO PANEL
// ================================================================

function RoomInfoPanel({ itemCount, selectedItem }: {
  itemCount: number
  selectedItem: FurnitureItem | null
}) {
  return (
    <Panel
      position={[0.6, 1.5, -0.6]}
      width={0.3}
      height={0.35}
      backgroundColor="#0a0e1a"
      backgroundOpacity={0.88}
    >
      <Text position={[-0.12, 0.14, 0]} fontSize={0.016} color="#e0e7ff" bold>
        Room Info
      </Text>

      <Text position={[-0.12, 0.1, 0]} fontSize={0.009} color="#64748b">
        {`${itemCount} item${itemCount !== 1 ? 's' : ''} placed`}
      </Text>

      {selectedItem && (
        <>
          <Text position={[-0.12, 0.05, 0]} fontSize={0.012} color="#c7d2fe" bold>
            {selectedItem.name}
          </Text>
          <Text position={[-0.12, 0.02, 0]} fontSize={0.009} color="#64748b">
            {`${(selectedItem.dimensions[0] * 100).toFixed(0)} x ${(selectedItem.dimensions[2] * 100).toFixed(0)} x ${(selectedItem.dimensions[1] * 100).toFixed(0)} cm`}
          </Text>
          <Text position={[-0.12, -0.005, 0]} fontSize={0.011} color="#34d399">
            {`$${selectedItem.price}`}
          </Text>
        </>
      )}

      <Text position={[-0.12, -0.08, 0]} fontSize={0.008} color="#475569" maxWidth={0.25}>
        Tap a surface to place. Click an item to select. Grab to move.
      </Text>
    </Panel>
  )
}

// ================================================================
// PLACEMENT PREVIEW
// ================================================================

function PlacementPreview({ item }: { item: FurnitureItem | null }) {
  const { results } = useHitTest({ source: 'viewer' })
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !item) {
      if (groupRef.current) groupRef.current.visible = false
      return
    }
    if (results.length > 0) {
      const hit = results[0]
      groupRef.current.visible = true
      groupRef.current.position.copy(hit.position)
    } else {
      groupRef.current.visible = false
    }
  })

  if (!item) return null

  return (
    <group ref={groupRef}>
      {/* Ghost preview */}
      <group scale={[1, 1, 1]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
          <ringGeometry args={[
            Math.max(item.dimensions[0], item.dimensions[2]) * 0.4,
            Math.max(item.dimensions[0], item.dimensions[2]) * 0.5,
            32
          ]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Size indicator */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
          <planeGeometry args={[item.dimensions[0], item.dimensions[2]]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}

// ================================================================
// AUDIO
// ================================================================

function AudioSetup() {
  useAudioListener()
  return null
}

// ================================================================
// MAIN XR CONTENT
// ================================================================

function XRContent({ placedItems, selectedId, onSelectItem, placingItem, onPlaceAtHit }: {
  placedItems: PlacedFurniture[]
  selectedId: string | null
  onSelectItem: (id: string) => void
  placingItem: FurnitureItem | null
  onPlaceAtHit: () => void
}) {
  const { planes } = usePlanes({ filter: 'all' })

  return (
    <XRScene>
      <XROrigin />

      {/* Hands */}
      <HandModel hand="left" model="spheres" color="#a78bfa" opacity={0.5} jointSize={0.004} />
      <HandModel hand="right" model="spheres" color="#60a5fa" opacity={0.5} jointSize={0.004} />
      <HandRay hand="right" color="#818cf8" opacity={0.15} maxLength={5} />

      {/* Placed furniture */}
      {placedItems.map(placed => {
        const catalogItem = CATALOG.find(c => c.id === placed.catalogId)
        if (!catalogItem) return null
        return (
          <PlacedItem
            key={placed.id}
            placed={placed}
            catalogItem={catalogItem}
            isSelected={selectedId === placed.id}
            onSelect={() => onSelectItem(placed.id)}
          />
        )
      })}

      {/* Placement preview */}
      <PlacementPreview item={placingItem} />

      {/* Plane overlay */}
      <PlaneOverlay filter="horizontal" color="#818cf8" opacity={0.04} />

      {/* Audio */}
      <AudioSetup />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
        color="#f0eee6"
      />
      <pointLight position={[-2, 2, 1]} intensity={0.15} color="#818cf8" distance={6} />
      <pointLight position={[2, 2, -1]} intensity={0.15} color="#f0c6a0" distance={6} />

      {/* Environment */}
      <Environment preset="apartment" />
      <fog attach="fog" args={['#0a0a12', 5, 15]} />

      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.95} />
      </mesh>
      <gridHelper args={[12, 48, '#1a1a2e', '#12121e']} position={[0, 0.001, 0]} />

      {/* Desktop controls */}
      <OrbitControls target={[0, 0.5, -1]} enableDamping dampingFactor={0.05} />
    </XRScene>
  )
}

// ================================================================
// HTML OVERLAY
// ================================================================

function UI({ onPlace }: { onPlace: (item: FurnitureItem) => void }) {
  const { start, isActive } = useXRSession()
  const support = useXRSupport()

  if (isActive) return null

  return (
    <>
      <div className="title-overlay">
        <h1>Furniture Planner</h1>
        <p>Design your space in mixed reality</p>
      </div>
      <div className="status-pill">
        <span>Desktop</span> &middot; Click buttons to place furniture
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
        {CATALOG.slice(0, 5).map(item => (
          <button
            key={item.id}
            className="xr-button"
            style={{ background: `rgba(255,255,255,0.06)`, borderColor: item.color }}
            onClick={() => onPlace(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </>
  )
}

// ================================================================
// APP ROOT
// ================================================================

export default function App() {
  const [placedItems, setPlacedItems] = useState<PlacedFurniture[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [placingItem, setPlacingItem] = useState<FurnitureItem | null>(null)
  const countRef = useRef(0)

  const budget = 5000
  const spent = placedItems.reduce((sum, p) => {
    const item = CATALOG.find(c => c.id === p.catalogId)
    return sum + (item?.price ?? 0)
  }, 0)

  const handlePlace = useCallback((item: FurnitureItem) => {
    // On desktop, place in front of camera. In XR, would use hit test.
    const id = `placed-${countRef.current++}`
    const x = (Math.random() - 0.5) * 2
    const z = -1 - Math.random() * 2
    setPlacedItems(prev => [...prev, {
      id,
      catalogId: item.id,
      position: [x, 0, z],
      rotation: Math.random() * Math.PI * 0.3 - Math.PI * 0.15,
    }])
    setSelectedId(id)
  }, [])

  const selectedCatalogItem = selectedId
    ? CATALOG.find(c => c.id === placedItems.find(p => p.id === selectedId)?.catalogId) ?? null
    : null

  return (
    <XRProvider
      features={['hand-tracking', 'plane-detection', 'hit-test', 'anchors', 'local-floor']}
      onError={(err) => console.error('XR Error:', err)}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [2, 1.8, 3], fov: 55 }}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <UIProvider>
            <GazePointer size={0.003} color="#e0e7ff" />
            <XRContent
              placedItems={placedItems}
              selectedId={selectedId}
              onSelectItem={setSelectedId}
              placingItem={placingItem}
              onPlaceAtHit={() => {}}
            />
            <CatalogPanel onPlace={handlePlace} budget={budget} spent={spent} />
            <RoomInfoPanel itemCount={placedItems.length} selectedItem={selectedCatalogItem} />
          </UIProvider>
        </Canvas>
        <UI onPlace={handlePlace} />
      </div>
    </XRProvider>
  )
}
