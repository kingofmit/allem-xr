'use client'

import React from 'react'
import { SpatialText } from './SpatialText'
import type { TextProps } from '../types'

/**
 * SDF text rendering in 3D space.
 */
export function Text({
  children,
  fontSize = 0.02,
  color = 'white',
  maxWidth,
  textAlign = 'left',
  position = [0, 0, 0],
  bold = false,
  lineHeight = 1.2,
}: TextProps) {
  return (
    <SpatialText
      text={children}
      fontSize={fontSize}
      color={color}
      maxWidth={maxWidth}
      textAlign={textAlign}
      anchorX={textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left'}
      anchorY="top"
      position={position}
      lineHeight={lineHeight}
      fontWeight={bold ? 'bold' : 'normal'}
    />
  )
}
