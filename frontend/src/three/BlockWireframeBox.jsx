import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { STATION_BOX_DELTA } from '../store/useOceanStore';

const BLOCK_SIZE = 10.0;
const BLOCK_HEIGHT = 8.0;
const MAX_DEPTH = 2000.0;

export default function BlockWireframeBox({ station, activeDepth }) {
  const halfSize = BLOCK_SIZE / 2;

  const depthTicks = [
    { depth: 0, label: '0m' },
    { depth: 200, label: '200m' },
    { depth: 500, label: '500m' },
    { depth: 1000, label: '1000m' },
    { depth: 2000, label: '2000m' },
  ];

  // Wireframe box lines
  const wireframeGeometries = useMemo(() => {
    // 4 vertical pillars
    const pillars = [
      [-halfSize, -halfSize],
      [halfSize, -halfSize],
      [halfSize, halfSize],
      [-halfSize, halfSize],
    ].map(([x, z]) => {
      const pts = [
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x, -BLOCK_HEIGHT, z),
      ];
      return new THREE.BufferGeometry().setFromPoints(pts);
    });

    // Top and bottom square perimeters
    const makePerimeter = (y) => {
      const pts = [
        new THREE.Vector3(-halfSize, y, -halfSize),
        new THREE.Vector3(halfSize, y, -halfSize),
        new THREE.Vector3(halfSize, y, halfSize),
        new THREE.Vector3(-halfSize, y, halfSize),
        new THREE.Vector3(-halfSize, y, -halfSize),
      ];
      return new THREE.BufferGeometry().setFromPoints(pts);
    };

    return {
      pillars,
      top: makePerimeter(0),
      bottom: makePerimeter(-BLOCK_HEIGHT),
    };
  }, [halfSize]);

  // Active depth cursor indicator line on vertical scale
  const activeY = -(Math.min(MAX_DEPTH, Math.max(0, activeDepth)) / MAX_DEPTH) * BLOCK_HEIGHT;

  const boundsInfo = useMemo(() => {
    if (!station) return null;
    const lat = station.latitude;
    const lon = station.longitude;
    return {
      north: (lat + STATION_BOX_DELTA).toFixed(1) + '°N',
      south: (lat - STATION_BOX_DELTA).toFixed(1) + '°N',
      west: (lon - STATION_BOX_DELTA).toFixed(1) + '°E',
      east: (lon + STATION_BOX_DELTA).toFixed(1) + '°E',
    };
  }, [station]);

  return (
    <group>
      {/* Corner Pillars */}
      {wireframeGeometries.pillars.map((geo, idx) => (
        <line key={idx} geometry={geo}>
          <lineBasicMaterial color="#334155" transparent opacity={0.7} />
        </line>
      ))}

      {/* Top and Bottom Frames */}
      <line geometry={wireframeGeometries.top}>
        <lineBasicMaterial color="#0284c7" transparent opacity={0.8} />
      </line>
      <line geometry={wireframeGeometries.bottom}>
        <lineBasicMaterial color="#1e293b" transparent opacity={0.6} />
      </line>

      {/* Subtle Seabed Grid Floor at -BLOCK_HEIGHT */}
      <gridHelper
        args={[BLOCK_SIZE, 10, '#0284c7', '#0f172a']}
        position={[0, -BLOCK_HEIGHT, 0]}
      />

      {/* Depth Scale Ticks on Corner */}
      {depthTicks.map((tick) => {
        const y = -(tick.depth / MAX_DEPTH) * BLOCK_HEIGHT;
        return (
          <group key={tick.depth} position={[-halfSize, y, -halfSize]}>
            {/* Small horizontal tick marker */}
            <mesh position={[-0.15, 0, 0]}>
              <boxGeometry args={[0.3, 0.02, 0.02]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
            {/* Tick Text Label */}
            <Html position={[-0.4, 0, 0]} distanceFactor={15}>
              <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap select-none">
                {tick.label}
              </span>
            </Html>
          </group>
        );
      })}

      {/* Active Depth Marker Line on Corner */}
      <group position={[-halfSize, activeY, -halfSize]}>
        <mesh position={[-0.2, 0, 0]}>
          <boxGeometry args={[0.4, 0.04, 0.04]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <Html position={[-0.8, 0, 0]} distanceFactor={15}>
          <span className="px-1 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-[10px] font-mono font-bold text-cyan-300 whitespace-nowrap">
            {activeDepth}m
          </span>
        </Html>
      </group>

      {/* Geographic Bounds Labels on Top Edges */}
      {boundsInfo && (
        <group>
          {/* North */}
          <Html position={[0, 0.1, -halfSize - 0.4]} center distanceFactor={16}>
            <span className="text-[10px] font-mono text-slate-400 font-semibold select-none">
              N: {boundsInfo.north}
            </span>
          </Html>
          {/* South */}
          <Html position={[0, 0.1, halfSize + 0.4]} center distanceFactor={16}>
            <span className="text-[10px] font-mono text-slate-400 font-semibold select-none">
              S: {boundsInfo.south}
            </span>
          </Html>
          {/* West */}
          <Html position={[-halfSize - 0.5, 0.1, 0]} center distanceFactor={16}>
            <span className="text-[10px] font-mono text-slate-400 font-semibold select-none">
              W: {boundsInfo.west}
            </span>
          </Html>
          {/* East */}
          <Html position={[halfSize + 0.5, 0.1, 0]} center distanceFactor={16}>
            <span className="text-[10px] font-mono text-slate-400 font-semibold select-none">
              E: {boundsInfo.east}
            </span>
          </Html>
        </group>
      )}
    </group>
  );
}
