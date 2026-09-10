import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import OceanBasin from './OceanBasin';
import GriddedLayer from './GriddedLayer';
import CurrentParticles from './CurrentParticles';
import ArgoFloatMarkers from './ArgoFloatMarkers';
import DepthGrid from './DepthGrid';

export default function OceanScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 16, 28]} fov={46} near={0.1} far={200} />
        
        {/* Ocean Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[15, 25, 10]} intensity={1.2} color="#f0f9ff" />
        <directionalLight position={[-15, 10, -15]} intensity={0.4} color="#38bdf8" />
        <pointLight position={[0, -2, 0]} intensity={0.3} color="#0284c7" />

        {/* Scene Background and Depth Fog */}
        <color attach="background" args={['#040a16']} />
        <fog attach="fog" args={['#040a16', 30, 80]} />

        {/* 3D Ocean Components */}
        <OceanBasin />
        <GriddedLayer />
        <CurrentParticles />
        <ArgoFloatMarkers />
        <DepthGrid />

        {/* Orbit Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 + 0.05} // Don't flip below bottom
          minDistance={4}
          maxDistance={65}
          target={[0, -1.5, 0]}
        />
      </Canvas>
    </div>
  );
}
