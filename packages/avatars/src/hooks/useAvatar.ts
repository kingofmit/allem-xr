'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import type { AvatarConfig, AvatarState, IKEffector } from '../types'

/**
 * Load a GLB/VRM avatar model and manage IK targets.
 */
export function useAvatar(config: AvatarConfig): AvatarState {
  const { modelUrl, scale = 1, ikEnabled = true } = config
  const [isLoaded, setIsLoaded] = useState(false)
  const sceneRef = useRef<THREE.Group | null>(null)
  const bonesRef = useRef<Map<string, THREE.Object3D>>(new Map())
  const ikTargetsRef = useRef<Map<IKEffector, { position: THREE.Vector3; rotation?: THREE.Quaternion }>>(new Map())

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        // Dynamic import to avoid SSR issues
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const loader = new GLTFLoader()

        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(modelUrl, resolve, undefined, reject)
        })

        if (cancelled) return

        const scene = gltf.scene as THREE.Group
        scene.scale.setScalar(scale)

        // Collect all bones
        const bones = new Map<string, THREE.Object3D>()
        scene.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Bone).isBone) {
            bones.set(child.name.toLowerCase(), child)
          }
        })

        sceneRef.current = scene
        bonesRef.current = bones
        setIsLoaded(true)
      } catch (e) {
        console.error('[allem-xr] Failed to load avatar model:', e)
      }
    }

    loadModel()

    return () => {
      cancelled = true
      if (sceneRef.current) {
        sceneRef.current.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.geometry?.dispose()
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose())
            } else {
              mesh.material?.dispose()
            }
          }
        })
        sceneRef.current = null
      }
      bonesRef.current.clear()
      setIsLoaded(false)
    }
  }, [modelUrl, scale])

  const setIKTarget = useCallback((effector: IKEffector, position: THREE.Vector3, rotation?: THREE.Quaternion) => {
    ikTargetsRef.current.set(effector, { position, rotation })
  }, [])

  return {
    isLoaded,
    scene: sceneRef.current,
    setIKTarget,
    bones: bonesRef.current,
  }
}
