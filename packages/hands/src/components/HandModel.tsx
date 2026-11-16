'use client'

import React, { useRef, useMemo } from 'react'
import type { Group, Mesh, LineSegments } from 'three'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'
import { useXRContext, useXRFrame } from '@allem-xr/core'

// Ensure R3F knows about Group for JSX
extend({ Group: THREE.Group })
import type { HandModelProps, XRHandJointName } from '../types'
import { JOINT_NAMES } from '../hooks/useHands'

// Bone connections: pairs of joint indices to draw lines between
const BONE_CONNECTIONS: [XRHandJointName, XRHandJointName][] = [
  // Thumb
  ['wrist', 'thumb-metacarpal'],
  ['thumb-metacarpal', 'thumb-phalanx-proximal'],
  ['thumb-phalanx-proximal', 'thumb-phalanx-distal'],
  ['thumb-phalanx-distal', 'thumb-tip'],
  // Index
  ['wrist', 'index-finger-metacarpal'],
  ['index-finger-metacarpal', 'index-finger-phalanx-proximal'],
  ['index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate'],
  ['index-finger-phalanx-intermediate', 'index-finger-phalanx-distal'],
  ['index-finger-phalanx-distal', 'index-finger-tip'],
  // Middle
  ['wrist', 'middle-finger-metacarpal'],
  ['middle-finger-metacarpal', 'middle-finger-phalanx-proximal'],
  ['middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate'],
  ['middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal'],
  ['middle-finger-phalanx-distal', 'middle-finger-tip'],
  // Ring
  ['wrist', 'ring-finger-metacarpal'],
  ['ring-finger-metacarpal', 'ring-finger-phalanx-proximal'],
  ['ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate'],
  ['ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal'],
  ['ring-finger-phalanx-distal', 'ring-finger-tip'],
  // Pinky
  ['wrist', 'pinky-finger-metacarpal'],
  ['pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal'],
  ['pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate'],
  ['pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal'],
  ['pinky-finger-phalanx-distal', 'pinky-finger-tip'],
]

/**
 * Renders a visual hand model driven by XR hand tracking data.
 * Updates imperatively each frame -- no React re-renders.
 */
export function HandModel({
  hand,
  model = 'spheres',
  color = '#ffffff',
  opacity = 0.8,
  jointSize = 0.005,
}: HandModelProps) {
  const ctx = useXRContext()
  const groupRef = useRef<Group>(null)
  const jointMeshesRef = useRef<Map<XRHandJointName, Mesh>>(new Map())
  const bonesRef = useRef<LineSegments>(null)
  // Pre-allocated buffer for bone positions (25 connections × 2 points × 3 coords)
  const bonePositionsRef = useRef(new Float32Array(BONE_CONNECTIONS.length * 6))

  const jointMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        depthTest: true,
      }),
    [color, opacity]
  )

  const boneMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity: opacity * 0.6,
      }),
    [color, opacity]
  )

  const jointGeometry = useMemo(
    () => new THREE.SphereGeometry(jointSize, 8, 8),
    [jointSize]
  )

  // Per-frame update of joint positions
  useXRFrame((frame, _delta, referenceSpace) => {
    const group = groupRef.current
    if (!group) return

    const state = ctx.getFrameState()

    // Find the XRHand for this handedness
    let xrHand: XRHand | null = null
    for (const input of state.inputSources) {
      if (input.handedness === hand && input.hand) {
        xrHand = input.hand
        break
      }
    }

    if (!xrHand) {
      group.visible = false
      return
    }

    group.visible = true

    // Update joint sphere positions
    for (const jointName of JOINT_NAMES) {
      const jointSpace = xrHand.get(jointName as XRHandJoint)
      if (!jointSpace) continue

      const pose = frame.getJointPose?.(jointSpace, referenceSpace)
      if (!pose) continue

      let mesh = jointMeshesRef.current.get(jointName)
      if (!mesh) {
        mesh = new THREE.Mesh(jointGeometry, jointMaterial)
        jointMeshesRef.current.set(jointName, mesh)
        group.add(mesh)
      }

      mesh.position.set(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      )
      mesh.quaternion.set(
        pose.transform.orientation.x,
        pose.transform.orientation.y,
        pose.transform.orientation.z,
        pose.transform.orientation.w
      )

      // Scale by joint radius if available
      if (pose.radius) {
        const scale = pose.radius / jointSize
        mesh.scale.setScalar(scale)
      }
    }

    // Update bone lines
    if (model !== 'abstract') {
      const buffer = bonePositionsRef.current
      let offset = 0
      for (const [from, to] of BONE_CONNECTIONS) {
        const fromSpace = xrHand.get(from as XRHandJoint)
        const toSpace = xrHand.get(to as XRHandJoint)
        if (!fromSpace || !toSpace) continue

        const fromPose = frame.getJointPose?.(fromSpace, referenceSpace)
        const toPose = frame.getJointPose?.(toSpace, referenceSpace)
        if (!fromPose || !toPose) continue

        buffer[offset++] = fromPose.transform.position.x
        buffer[offset++] = fromPose.transform.position.y
        buffer[offset++] = fromPose.transform.position.z
        buffer[offset++] = toPose.transform.position.x
        buffer[offset++] = toPose.transform.position.y
        buffer[offset++] = toPose.transform.position.z
      }

      let lines = bonesRef.current
      if (!lines) {
        const geo = new THREE.BufferGeometry()
        const attr = new THREE.BufferAttribute(buffer.slice(0, offset), 3)
        attr.setUsage(THREE.DynamicDrawUsage)
        geo.setAttribute('position', attr)
        lines = new THREE.LineSegments(geo, boneMaterial)
        bonesRef.current = lines
        group.add(lines)
      } else {
        const attr = lines.geometry.getAttribute('position') as THREE.BufferAttribute
        // Update in place — no new allocations
        const arr = attr.array as Float32Array
        arr.set(buffer.subarray(0, offset))
        attr.needsUpdate = true
        lines.geometry.setDrawRange(0, offset / 3)
        lines.geometry.attributes.position.needsUpdate = true
      }
    }
  })

  return <group ref={groupRef} />
}
