'use client'

import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { AvatarMirrorProps } from '../types'

/**
 * A reflective mirror surface — look at it to see your avatar.
 * Uses a render target for real-time reflection.
 *
 * NOTE: This component allocates Vector3 instances per frame for the reflection
 * camera computation. This is acceptable because mirror rendering is inherently
 * expensive (full scene re-render) and the vector allocations are negligible
 * compared to the render pass itself.
 */
export function AvatarMirror({
  position = [0, 1.5, -2],
  width = 1,
  height = 2,
  resolution = 512,
}: AvatarMirrorProps) {
  const { gl, scene, camera } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)

  const renderTarget = useMemo(
    () => new THREE.WebGLRenderTarget(resolution, resolution * (height / width)),
    [resolution, width, height]
  )

  const mirrorCamera = useMemo(
    () => new THREE.PerspectiveCamera(50, width / height, 0.1, 100),
    [width, height]
  )

  useFrame(() => {
    if (!meshRef.current) return

    // Position mirror camera as reflection of main camera
    const mirrorPos = meshRef.current.getWorldPosition(new THREE.Vector3())
    const mirrorNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(meshRef.current.quaternion)

    // Reflect camera position across mirror plane
    const cameraToMirror = new THREE.Vector3().subVectors(camera.position, mirrorPos)
    const reflected = cameraToMirror.clone().sub(
      mirrorNormal.clone().multiplyScalar(2 * cameraToMirror.dot(mirrorNormal))
    )
    mirrorCamera.position.copy(mirrorPos).add(reflected)
    mirrorCamera.lookAt(mirrorPos)

    // Render reflection
    meshRef.current.visible = false
    gl.setRenderTarget(renderTarget)
    gl.render(scene, mirrorCamera)
    gl.setRenderTarget(null)
    meshRef.current.visible = true
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={renderTarget.texture} side={THREE.DoubleSide} />
    </mesh>
  )
}
