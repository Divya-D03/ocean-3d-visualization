import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useOceanStore } from '../store/useOceanStore';
import { geoToThree } from './coords';

export default function DepthGrid() {
  const layerVisibility = useOceanStore((state) => state.layerVisibility);

  const depthLevels = [
    { depth: 0, label: '0m (Surface)' },
    { depth: 200, label: '-200m (Thermocline)' },
    { depth: 500, label: '-500m (Mesopelagic)' },
    { depth: 1000, label: '-1000m (Bathypelagic)' },
    { depth: 2000, label: '-2000m (Deep Ocean)' },
  ];

  // Bounding box dimensions in 3D space
  const [minX, , minZ] = geoToThree(-25.0, 45.0, 0);
  const [maxX, , maxZ] = geoToThree(25.0, 105.0, 0);

  // Depth grid lines
  const depthGeometries = useMemo(() => {
    return depthLevels.map((lvl) => {
      const [, y] = geoToThree(0, 0, lvl.depth);
      const points = [
        new THREE.Vector3(minX, y, minZ),
        new THREE.Vector3(maxX, y, minZ),
        new THREE.Vector3(maxX, y, maxZ),
        new THREE.Vector3(minX, y, maxZ),
        new THREE.Vector3(minX, y, minZ),
      ];
      return {
        geo: new THREE.BufferGeometry().setFromPoints(points),
        y,
        label: lvl.label,
      };
    });
  }, [minX, maxX, minZ, maxZ]);

  // Vertical pillar lines
  const cornerPillars = useMemo(() => {
    const corners = [
      [minX, minZ],
      [maxX, minZ],
      [maxX, maxZ],
      [minX, maxZ],
    ];
    return corners.map(([x, z]) => {
      const points = [
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x, -6.0, z),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, [minX, maxX, minZ, maxZ]);

  if (!layerVisibility.depthGrid) return null;

  return (
    <group>
      {/* Depth horizontal rectangles */}
      {depthGeometries.map((item, idx) => (
        <group key={idx}>
          <line geometry={item.geo}>
            <lineBasicMaterial color="#1e293b" transparent opacity={0.6} />
          </line>
          {/* Depth Label at the corner */}
          <Html position={[minX - 0.5, item.y, minZ]} distanceFactor={25}>
            <span
              style={{
                color: '#64748b',
                fontSize: '10px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {item.label}
            </span>
          </Html>
        </group>
      ))}

      {/* Vertical corner pillars */}
      {cornerPillars.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial color="#334155" transparent opacity={0.7} />
        </line>
      ))}

      {/* Compass / Orientation */}
      <Html position={[maxX - 1, 0.5, maxZ + 1]} distanceFactor={20}>
        <div
          style={{
            color: '#38bdf8',
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #0284c7',
          }}
        >
          ▲ N (Indian Ocean Basin)
        </div>
      </Html>
    </group>
  );
}
