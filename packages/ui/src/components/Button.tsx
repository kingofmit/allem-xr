'use client'


import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react'
import * as THREE from 'three'
import type { Group, Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { SpatialText } from './SpatialText'
import { useUIContext } from '../context'
import type { ButtonProps } from '../types'

// Simple spring for smooth hover/active transitions
function springLerp(current: number, target: number, speed: number, delta: number): number {
  return current + (target - current) * Math.min(1, speed * delta)
}

/**
 * An interactive button that responds to gaze, pinch, click, and controller input.
 */
export function Button({
  children,
  onSelect,
  onHover,
  onUnhover,
  width = 0.12,
  height = 0.04,
  color = '#333333',
  hoverColor = '#4488ff',
  activeColor = '#2266dd',
  textColor = '#ffffff',
  fontSize = 0.016,
  disabled = false,
  position = [0, 0, 0],
}: ButtonProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const uiCtx = useUIContext()
  const [interactionState, setInteractionState] = useState<'idle' | 'hovered' | 'active'>('idle')
  const idRef = useRef(`btn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)
  const currentColorRef = useRef(new THREE.Color(color))
  const targetColorRef = useRef(new THREE.Color(color))
  const scaleRef = useRef(1)

  // Register with UI interaction system
  useEffect(() => {
    if (!uiCtx || !meshRef.current || disabled) return

    const id = idRef.current
    uiCtx.register(id, meshRef.current, {
      onHover: () => {
        setInteractionState('hovered')
        onHover?.()
      },
      onUnhover: () => {
        setInteractionState('idle')
        onUnhover?.()
      },
      onSelect: () => {
        if (!disabled) onSelect?.()
      },
    })

    return () => uiCtx.unregister(id)
  }, [uiCtx, disabled, onSelect, onHover, onUnhover])

  // Update target color based on state
  useEffect(() => {
    switch (interactionState) {
      case 'hovered':
        targetColorRef.current.set(hoverColor)
        break
      case 'active':
        targetColorRef.current.set(activeColor)
        break
      default:
        targetColorRef.current.set(disabled ? '#555555' : color)
    }
  }, [interactionState, color, hoverColor, activeColor, disabled])

  // Animate color and scale
  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const mat = mesh.material as THREE.MeshBasicMaterial
    currentColorRef.current.lerp(targetColorRef.current, Math.min(1, 12 * delta))
    mat.color.copy(currentColorRef.current)

    const targetScale = interactionState === 'hovered' ? 1.05 : interactionState === 'active' ? 0.95 : 1
    scaleRef.current = springLerp(scaleRef.current, targetScale, 10, delta)
    mesh.scale.setScalar(scaleRef.current)
  })

  const label = typeof children === 'string' ? children : ''

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={disabled ? undefined : onSelect}
        onPointerOver={() => !disabled && setInteractionState('hovered')}
        onPointerOut={() => setInteractionState('idle')}
        onPointerDown={() => !disabled && setInteractionState('active')}
        onPointerUp={() => setInteractionState(interactionState === 'active' ? 'hovered' : 'idle')}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={color} transparent opacity={disabled ? 0.4 : 0.9} side={THREE.DoubleSide} />
      </mesh>
      {label && (
        <SpatialText
          text={label}
          fontSize={fontSize}
          color={disabled ? '#888888' : textColor}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.001]}
          maxWidth={width - 0.01}
        />
      )}
    </group>
  )
}
