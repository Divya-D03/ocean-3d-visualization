import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

/**
 * RotatingCube — a simple test mesh that confirms the R3F render pipeline works.
 * Replace this with ocean scene components once each team area is ready.
 */
function RotatingCube() {
  const meshRef = useRef()

  useFrame((_state, delta) => {
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.8
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#0ea5e9" wireframe={false} />
    </mesh>
  )
}

/**
 * App — root component.
 *
 * Scenes go in src/scenes/.
 * Reusable components go in src/components/.
 * This file wires them together.
 */
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0f1e' }}>
      {/* Scaffold banner — remove once real scene is in place */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#7dd3fc',
          fontFamily: 'monospace',
          fontSize: '14px',
          background: 'rgba(0,0,0,0.5)',
          padding: '6px 14px',
          borderRadius: 6,
          zIndex: 10,
        }}
      >
        🌊 Ocean 3D Visualization Platform — scaffold ready
      </div>

      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <RotatingCube />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
