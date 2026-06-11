'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

function SphereMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.z = t * 0.15
    }
  })

  return (
    <mesh ref={meshRef} position={[0, -0.7, 0]}>
      <sphereGeometry args={[2.5, 24, 24]} />
      <meshBasicMaterial color="#d4d4d4" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

export default function HeroBg3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: false }}>
        <SphereMesh />
      </Canvas>
    </div>
  )
}
