'use client'


import React, { useState } from 'react'
import * as THREE from 'three'
import { SpatialText } from './SpatialText'
import type { RadialMenuProps } from '../types'

const ITEM_RADIUS = 0.03

/**
 * A radial context menu for spatial selection.
 */
export function RadialMenu({
  items,
  visible,
  position = [0, 0, 0],
  radius = 0.12,
  itemColor = '#333333',
  itemHoverColor = '#4488ff',
}: RadialMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  if (!visible || items.length === 0) return null

  return (
    <group position={position}>
      {items.map((item, i) => {
        const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const isHovered = hoveredIndex === i

        return (
          <group key={item.id} position={[x, y, 0]}>
            {/* Item circle */}
            <mesh
              onClick={() => item.onSelect()}
              onPointerOver={() => setHoveredIndex(i)}
              onPointerOut={() => setHoveredIndex(-1)}
            >
              <circleGeometry args={[ITEM_RADIUS, 24]} />
              <meshBasicMaterial
                color={isHovered ? (item.color ?? itemHoverColor) : itemColor}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Label */}
            <SpatialText
              text={item.label}
              fontSize={0.01}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              position={[0, 0, 0.001]}
              maxWidth={ITEM_RADIUS * 1.8}
            />
          </group>
        )
      })}
    </group>
  )
}
