import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { sampleColormap } from '../utils/colormaps';

const MAX_DEPTH = 2000.0;
const BLOCK_HEIGHT = 8.0;

export default function BlockCTDColumn({ station, profile, griddedProfile, variable = 'temperature' }) {
  // Measurements from real float or collocated gridded profile
  const measurementBeads = useMemo(() => {
    const list = [];
    const sourceList = profile?.measurements || griddedProfile?.levels || [];
    const cmapName = variable === 'salinity' ? 'haline' : 'turbo';

    sourceList.forEach((m, idx) => {
      const d = m.depth || 0;
      if (d > MAX_DEPTH) return;

      const y = -(d / MAX_DEPTH) * BLOCK_HEIGHT;
      const val = variable === 'salinity' ? m.salinity : m.temperature;

      // Normalize value for coloring
      let norm = 0.5;
      if (val !== null && val !== undefined) {
        if (variable === 'salinity') {
          norm = Math.max(0, Math.min(1, (val - 32.0) / 5.0)); // 32 to 37 PSU
        } else {
          norm = Math.max(0, Math.min(1, (val - 4.0) / 26.0)); // 4 to 30 °C
        }
      }

      const c = sampleColormap(norm, cmapName);
      list.push({
        id: idx,
        depth: d,
        val,
        y,
        colorHex: '#' + c.getHexString(),
      });
    });

    return list;
  }, [profile, griddedProfile, variable]);

  const maxProfileDepth = station.max_depth || 2000.0;
  const bottomY = -(Math.min(MAX_DEPTH, maxProfileDepth) / MAX_DEPTH) * BLOCK_HEIGHT;

  const columnLine = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, bottomY, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [bottomY]);

  return (
    <group position={[0, 0, 0]}>
      {/* Vertical CTD profiling line */}
      <line geometry={columnLine}>
        <lineBasicMaterial color="#38bdf8" linewidth={2} />
      </line>

      {/* Surface float buoy */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Surface buoy antenna */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>

      {/* Station Floating Label */}
      <Html position={[0, 0.85, 0]} center distanceFactor={18}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md border border-amber-500/80 rounded-md text-[10px] font-mono text-amber-300 font-bold whitespace-nowrap shadow-xl shadow-black/80 pointer-events-none">
          <span>ARGO #{station.platform_number}</span>
          <span className="text-slate-400 font-normal">({station.latitude.toFixed(2)}°N, {station.longitude.toFixed(2)}°E)</span>
        </div>
      </Html>

      {/* CTD Sensor measurement depth beads */}
      {measurementBeads.map((bead) => (
        <group key={bead.id} position={[0, bead.y, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={bead.colorHex}
              emissive={bead.colorHex}
              emissiveIntensity={0.4}
              roughness={0.3}
            />
          </mesh>
          {/* Subtle horizontal marker ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.25, 16]} />
            <meshBasicMaterial color={bead.colorHex} opacity={0.5} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Bottom Sensor Anchor */}
      <mesh position={[0, bottomY, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}
