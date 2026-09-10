import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { geoToThree } from './coords';
import { useOceanStore } from '../store/useOceanStore';

// Coastline polygons for Indian Ocean Basin
const COASTLINES = [
  // Indian Subcontinent (West coast to East coast)
  [
    [24.0, 68.0], [23.0, 69.0], [22.0, 69.5], [21.0, 70.0], [20.8, 70.8], [21.5, 72.2], // Gujarat / Gulf of Khambhat
    [19.0, 72.8], [16.0, 73.5], [13.0, 74.8], [10.0, 76.0], [8.1, 77.5], // Mumbai, Goa, Kerala, Kanyakumari
    [9.0, 78.5], [10.5, 79.8], [13.1, 80.3], [16.0, 81.5], [17.7, 83.3], // Tamil Nadu, Chennai, Andhra
    [19.8, 85.8], [21.5, 87.0], [22.0, 89.0] // Odisha, West Bengal, Sundarbans
  ],
  // Sri Lanka
  [
    [9.8, 80.2], [8.5, 81.2], [7.0, 81.8], [6.0, 80.5], [7.0, 79.8], [8.5, 79.8], [9.8, 80.2]
  ],
  // Arabian Peninsula (Oman & Yemen)
  [
    [25.0, 56.5], [23.5, 58.5], [21.0, 59.0], [18.5, 56.5], [16.5, 53.0], [14.5, 49.0], [12.8, 45.0]
  ],
  // Horn of Africa (Somalia)
  [
    [12.0, 44.0], [11.8, 51.2], [9.0, 50.8], [5.0, 48.5], [1.0, 44.0], [-2.0, 41.0]
  ],
  // Southeast Asia (Myanmar, Thailand, Malaysia, Sumatra)
  [
    [20.0, 92.5], [16.0, 94.2], [14.0, 97.8], [10.0, 98.5], [5.0, 100.0], [1.5, 103.5],
    [-5.5, 105.5], [-3.0, 102.0], [0.0, 99.0], [5.5, 95.5]
  ],
  // Andaman & Nicobar Islands
  [
    [13.5, 93.0], [11.5, 92.7], [9.0, 92.8], [7.0, 93.8]
  ]
];

export default function OceanBasin() {
  const surfaceRef = useRef();
  const layerVisibility = useOceanStore((state) => state.layerVisibility);

  // Surface water animation
  useFrame((state) => {
    if (surfaceRef.current) {
      const t = state.clock.getElapsedTime();
      surfaceRef.current.material.opacity = 0.35 + Math.sin(t * 1.2) * 0.05;
    }
  });

  // Build 3D coastline line segments
  const coastlineGeometries = useMemo(() => {
    return COASTLINES.map((coords) => {
      const points = coords.map(([lat, lon]) => {
        const [x, , z] = geoToThree(lat, lon, 0);
        return new THREE.Vector3(x, 0.02, z);
      });
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  return (
    <group>
      {/* Semi-transparent ocean surface plane */}
      {layerVisibility.surface && (
        <mesh ref={surfaceRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[56, 42, 32, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.15}
            metalness={0.8}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Seabed Bathymetry Floor (at 2000m depth) */}
      <mesh position={[0, -6.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 42, 16, 16]} />
        <meshStandardMaterial
          color="#041226"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Coastline Outlines */}
      {layerVisibility.coastlines &&
        coastlineGeometries.map((geo, idx) => (
          <line key={idx} geometry={geo}>
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </line>
        ))}

      {/* Landmass Indicator Bases */}
      {layerVisibility.coastlines && (
        <group>
          {/* India Peninsula Plate */}
          <mesh position={[3.5, 0.01, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.5, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Arabian Plate */}
          <mesh position={[-11.0, 0.01, -6.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.0, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* East Africa Plate */}
          <mesh position={[-16.0, 0.01, 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4.5, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          {/* Southeast Asia Plate */}
          <mesh position={[17.0, 0.01, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[5.0, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}
