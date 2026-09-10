import { useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useOceanStore } from '../store/useOceanStore';
import { geoToThree } from './coords';

function FloatMarker({ float, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [x, , z] = geoToThree(float.latitude, float.longitude, 0);
  const [, bottomY] = geoToThree(float.latitude, float.longitude, float.max_depth || 1800);

  const linePoints = [
    new THREE.Vector3(x, 0.05, z),
    new THREE.Vector3(x, bottomY, z),
  ];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);

  const markerColor = isSelected ? '#f59e0b' : hovered ? '#38bdf8' : '#06b6d4';

  return (
    <group>
      {/* Vertical CTD profiling line dipping into the ocean depth */}
      <line geometry={lineGeo}>
        <lineBasicMaterial
          color={markerColor}
          transparent
          opacity={isSelected ? 0.9 : 0.4}
          linewidth={isSelected ? 2 : 1}
        />
      </line>

      {/* Surface float buoy */}
      <mesh
        position={[x, 0.12, z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(float);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[isSelected ? 0.35 : hovered ? 0.3 : 0.22, 16, 16]} />
        <meshStandardMaterial
          color={markerColor}
          emissive={markerColor}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Depth sensor anchor point */}
      <mesh position={[x, bottomY, z]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={markerColor} opacity={0.6} transparent />
      </mesh>

      {/* Floating Info Tooltip on Hover or Selection */}
      {(hovered || isSelected) && (
        <Html position={[x, 0.6, z]} center distanceFactor={15}>
          <div
            style={{
              background: 'rgba(10, 15, 30, 0.88)',
              border: `1px solid ${isSelected ? '#f59e0b' : '#38bdf8'}`,
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#fff',
              fontSize: '11px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              transform: 'translateY(-10px)',
            }}
          >
            <div style={{ fontWeight: 'bold', color: isSelected ? '#f59e0b' : '#7dd3fc' }}>
              ARGO #{float.platform_number} (Cycle {float.cycle_number})
            </div>
            <div>
              Lat: {float.latitude.toFixed(2)}° | Lon: {float.longitude.toFixed(2)}°
            </div>
            {float.surface_temp && (
              <div>
                Temp: {float.surface_temp}°C | Sal: {float.surface_sal} PSU
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              Max Depth: {float.max_depth || 2000}m
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ArgoFloatMarkers() {
  const observations = useOceanStore((state) => state.observations);
  const selectedFloat = useOceanStore((state) => state.selectedFloat);
  const selectFloat = useOceanStore((state) => state.selectFloat);
  const layerVisibility = useOceanStore((state) => state.layerVisibility);

  if (!layerVisibility.floats || !observations.length) {
    return null;
  }

  // Limit rendering to top 80 floats for smooth 60fps performance
  const displayFloats = observations.slice(0, 80);

  return (
    <group>
      {displayFloats.map((f) => (
        <FloatMarker
          key={`${f.platform_number}_${f.cycle_number}`}
          float={f}
          isSelected={selectedFloat?.platform_number === f.platform_number}
          onSelect={selectFloat}
        />
      ))}
    </group>
  );
}
