'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { AvatarMirrorProps } from '../types'

// Pre-allocated work vectors for mirror reflection
const _mirrorPos = new THREE.Vector3()
const _mirrorNormal = new THREE.Vector3()
const _cameraToMirror = new THREE.Vector3()
const _reflected = new THREE.Vector3()

/**
 * A reflective mirror surface — look at it to see your avatar.
 * Uses a render target for real-time reflection.
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

  useEffect(() => {
    return () => {
      renderTarget.dispose()
      mirrorCamera.clear()
    }
  }, [renderTarget, mirrorCamera])

  useFrame(() => {
    if (!meshRef.current) return

    meshRef.current.getWorldPosition(_mirrorPos)
    _mirrorNormal.set(0, 0, 1).applyQuaternion(meshRef.current.quaternion)

    _cameraToMirror.subVectors(camera.position, _mirrorPos)
    const dot = _cameraToMirror.dot(_mirrorNormal)
    _reflected.copy(_cameraToMirror).addScaledVector(_mirrorNormal, -2 * dot)
    mirrorCamera.position.copy(_mirrorPos).add(_reflected)
    mirrorCamera.lookAt(_mirrorPos)

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
