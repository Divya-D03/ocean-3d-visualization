import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOceanStore } from '../store/useOceanStore';
import { geoToThree } from './coords';
import { sampleColormap } from '../utils/colormaps';

const PARTICLE_COUNT = 1200;

export default function CurrentParticles() {
  const pointsRef = useRef();
  const currentsData = useOceanStore((state) => state.currentsData);
  const selectedParam = useOceanStore((state) => state.selectedParam);
  const layerVisibility = useOceanStore((state) => state.layerVisibility);

  // Setup particle system with initial positions, velocities, lifetimes
  const { geometry, particleData } = useMemo(() => {
    const pts = [];
    const colors = [];
    const pData = [];

    const bounds = currentsData?.points?.length > 0
      ? {
          latMin: Math.min(...currentsData.points.map((p) => p.lat)),
          latMax: Math.max(...currentsData.points.map((p) => p.lat)),
          lonMin: Math.min(...currentsData.points.map((p) => p.lon)),
          lonMax: Math.max(...currentsData.points.map((p) => p.lon)),
        }
      : { latMin: 5.0, latMax: 22.0, lonMin: 55.0, lonMax: 88.0 };

    // Lookup grid for velocities
    const grid = {};
    if (currentsData?.points) {
      currentsData.points.forEach((p) => {
        grid[`${p.lat.toFixed(1)}_${p.lon.toFixed(1)}`] = p;
      });
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const lat = bounds.latMin + Math.random() * (bounds.latMax - bounds.latMin);
      const lon = bounds.lonMin + Math.random() * (bounds.lonMax - bounds.lonMin);
      const [x, y, z] = geoToThree(lat, lon, 5.0);

      pts.push(x, y + 0.05, z);
      colors.push(0.3, 0.8, 1.0);

      pData.push({
        lat,
        lon,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60,
        speed: 10.0,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return { geometry: geo, particleData: pData, velocityGrid: grid };
  }, [currentsData]);

  // Animate flow particles
  useFrame((_, delta) => {
    if (!pointsRef.current || !particleData) return;

    const positions = pointsRef.current.geometry.attributes.position.array;
    const colors = pointsRef.current.geometry.attributes.color.array;

    const maxSpeed = currentsData?.max_speed || 30.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];
      p.life += delta * 25.0;

      // Find nearest vector in velocity grid
      const keyLat = (Math.round(p.lat * 2) / 2).toFixed(1);
      const keyLon = (Math.round(p.lon * 2) / 2).toFixed(1);
      const vector = currentsData?.points?.find(
        (pt) => Math.abs(pt.lat - p.lat) < 1.0 && Math.abs(pt.lon - p.lon) < 1.0
      );

      const u = vector ? vector.u : 8.0; // cm/s (zonal / east-west)
      const v = vector ? vector.v : 10.0; // cm/s (meridional / north-south)
      const spd = vector ? vector.speed : Math.sqrt(u * u + v * v);

      // Convert cm/s to degrees displacement per frame
      const speedScale = 0.0003;
      p.lon += u * speedScale;
      p.lat += v * speedScale;

      // Reset if expired or out of bounds
      if (p.life > p.maxLife || p.lat < -25 || p.lat > 25 || p.lon < 45 || p.lon > 105) {
        p.life = 0;
        p.lat = 5.0 + Math.random() * 18.0;
        p.lon = 58.0 + Math.random() * 32.0;
      }

      // Update 3D position
      const [x, y, z] = geoToThree(p.lat, p.lon, 5.0);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.06;
      positions[i * 3 + 2] = z;

      // Update color based on speed
      const normSpeed = Math.min(1.0, spd / maxSpeed);
      const c = sampleColormap(normSpeed, 'speed');
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (!layerVisibility.currents || (selectedParam !== 'currents' && selectedParam !== 'observations' && !layerVisibility.currents)) {
    // Only render when currents layer is active
    if (!layerVisibility.currents) return null;
  }

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
