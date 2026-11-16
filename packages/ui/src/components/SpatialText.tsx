'use client'

import { useRef, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
// @ts-ignore -- troika-three-text has no type declarations
import { Text as TroikaTextMesh } from 'troika-three-text'
import type { Group } from 'three'

interface SpatialTextProps {
  text: string
  fontSize?: number
  color?: string
  maxWidth?: number
  textAlign?: string
  anchorX?: string
  anchorY?: string
  lineHeight?: number
  fontWeight?: string
  position?: [number, number, number]
}

/**
 * Internal wrapper around troika-three-text that avoids JSX type issues.
 * Imperatively creates and manages a troika Text mesh.
 */
export const SpatialText = forwardRef<Group, SpatialTextProps>(function SpatialText(
  {
    text,
    fontSize = 0.02,
    color = 'white',
    maxWidth,
    textAlign = 'left',
    anchorX = 'left',
    anchorY = 'top',
    lineHeight = 1.2,
    fontWeight = 'normal',
    position = [0, 0, 0],
  },
  ref
) {
  const groupRef = useRef<Group>(null)
  const textMeshRef = useRef<any>(null)

  useEffect(() => {
    const group = (ref as React.MutableRefObject<Group>)?.current ?? groupRef.current
    if (!group) return

    const textMesh = new TroikaTextMesh()
    textMesh.text = text
    textMesh.fontSize = fontSize
    textMesh.color = color
    if (maxWidth !== undefined) textMesh.maxWidth = maxWidth
    textMesh.textAlign = textAlign
    textMesh.anchorX = anchorX
    textMesh.anchorY = anchorY
    textMesh.lineHeight = lineHeight
    textMesh.fontWeight = fontWeight
    textMesh.sync()

    group.add(textMesh)
    textMeshRef.current = textMesh

    return () => {
      group.remove(textMesh)
      textMesh.dispose()
      textMeshRef.current = null
    }
  }, []) // Only create once

  // Update properties reactively
  useEffect(() => {
    const mesh = textMeshRef.current
    if (!mesh) return
    mesh.text = text
    mesh.fontSize = fontSize
    mesh.color = color
    if (maxWidth !== undefined) mesh.maxWidth = maxWidth
    mesh.textAlign = textAlign
    mesh.anchorX = anchorX
    mesh.anchorY = anchorY
    mesh.lineHeight = lineHeight
    mesh.fontWeight = fontWeight
    mesh.sync()
  }, [text, fontSize, color, maxWidth, textAlign, anchorX, anchorY, lineHeight, fontWeight])

  return <group ref={ref ?? groupRef} position={position} />
})
