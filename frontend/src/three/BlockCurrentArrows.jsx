import { useMemo } from 'react';
import * as THREE from 'three';
import { sampleColormap } from '../utils/colormaps';
import { STATION_BOX_DELTA } from '../store/useOceanStore';

const BLOCK_SIZE = 10.0;
const UP = new THREE.Vector3(0, 1, 0);

function ArrowGlyph({ u, v, speed, maxSpeed, position }) {
  const { quaternion, shaftLength, coneLength, colorHex } = useMemo(() => {
    // Guard against zero-length or degenerate direction vectors
    const lenSq = u * u + v * v;
    if (lenSq < 0.0001) {
      return { isZero: true };
    }

    // Calculate angle: atan2(v, u) where u is Eastward and v is Northward
    const angle = Math.atan2(v, u);
    // In Three.js block space: East (+u) is +X, North (+v) is -Z
    const directionVector = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, directionVector);

    const normSpeed = Math.min(1.0, Math.max(0, speed / (maxSpeed || 30.0)));
    // Scaled length: short/pale for slow, longer/warmer for fast
    const sLen = 0.35 + normSpeed * 0.85;
    const cLen = 0.26;
    const col = sampleColormap(normSpeed, 'speed');

    return {
      quaternion: quat,
      shaftLength: sLen,
      coneLength: cLen,
      colorHex: '#' + col.getHexString(),
    };
  }, [u, v, speed, maxSpeed]);

  if (!quaternion) {
    // Minimal marker for zero or missing vector
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#64748b" opacity={0.6} transparent />
      </mesh>
    );
  }

  const shaftRadius = 0.032;
  const coneRadius = 0.1;

  return (
    <group position={position}>
      {/* Rotated arrow assembly oriented along directionVector */}
      <group quaternion={quaternion}>
        {/* Cylinder Shaft */}
        <mesh position={[0, shaftLength / 2, 0]}>
          <cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 12]} />
          <meshStandardMaterial color={colorHex} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Cone Head */}
        <mesh position={[0, shaftLength + coneLength / 2, 0]}>
          <coneGeometry args={[coneRadius, coneLength, 12]} />
          <meshStandardMaterial color={colorHex} roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* Surface Base Point Marker */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={colorHex} opacity={0.7} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function BlockCurrentArrows({ currentsData, station }) {
  const arrows = useMemo(() => {
    if (!currentsData || !currentsData.points || !station) return [];

    const centerLat = station.latitude;
    const centerLon = station.longitude;
    const halfBox = STATION_BOX_DELTA;
    const maxSpeed = currentsData.max_speed || 30.0;

    const list = [];

    currentsData.points.forEach((pt, idx) => {
      // Check if point falls within station's 2° box
      const dLat = pt.lat - centerLat;
      const dLon = pt.lon - centerLon;

      if (Math.abs(dLat) <= halfBox && Math.abs(dLon) <= halfBox) {
        // Map to 3D Block coordinates [-5, +5]
        const x = (dLon / (halfBox * 2)) * BLOCK_SIZE;
        const z = -(dLat / (halfBox * 2)) * BLOCK_SIZE;
        const y = 0.08; // Surface plane

        list.push({
          id: idx,
          u: pt.u,
          v: pt.v,
          speed: pt.speed,
          position: [x, y, z],
          maxSpeed,
        });
      }
    });

    return list;
  }, [currentsData, station]);

  return (
    <group>
      {/* Static snapshot directional arrows on surface */}
      {arrows.map((a) => (
        <ArrowGlyph
          key={a.id}
          u={a.u}
          v={a.v}
          speed={a.speed}
          maxSpeed={a.maxSpeed}
          position={a.position}
        />
      ))}
    </group>
  );
}
