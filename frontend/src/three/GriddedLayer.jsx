import { useMemo } from 'react';
import * as THREE from 'three';
import { useOceanStore } from '../store/useOceanStore';
import { geoToThree } from './coords';
import { sampleColormap } from '../utils/colormaps';

export default function GriddedLayer() {
  const gridData = useOceanStore((state) => state.gridData);
  const selectedParam = useOceanStore((state) => state.selectedParam);
  const depth = useOceanStore((state) => state.depth);
  const layerVisibility = useOceanStore((state) => state.layerVisibility);

  // Colormap choice: 'turbo' for Temperature, 'haline' for Salinity
  const cmapName = selectedParam === 'salinity' ? 'haline' : 'turbo';

  const meshGeometry = useMemo(() => {
    if (!gridData || !gridData.latitudes || !gridData.longitudes || !gridData.values) {
      return null;
    }

    const { latitudes, longitudes, values, lat_dim, lon_dim, min_val, max_val } = gridData;
    if (lat_dim < 2 || lon_dim < 2) return null;

    const span = (max_val - min_val) || 1.0;

    // Create custom BufferGeometry
    const vertices = [];
    const colors = [];
    const indices = [];

    const [, yPos] = geoToThree(0, 0, depth);

    // Build grid vertices
    for (let i = 0; i < lat_dim; i++) {
      const lat = latitudes[i];
      for (let j = 0; j < lon_dim; j++) {
        const lon = longitudes[j];
        const [x, , z] = geoToThree(lat, lon, 0);
        vertices.push(x, yPos, z);

        const val = values[i * lon_dim + j];
        if (val !== null && val !== undefined) {
          const norm = (val - min_val) / span;
          const col = sampleColormap(norm, cmapName);
          colors.push(col.r, col.g, col.b);
        } else {
          // Missing value -> neutral deep ocean tone
          colors.push(0.05, 0.15, 0.25);
        }
      }
    }

    // Build triangle faces
    for (let i = 0; i < lat_dim - 1; i++) {
      for (let j = 0; j < lon_dim - 1; j++) {
        const a = i * lon_dim + j;
        const b = (i + 1) * lon_dim + j;
        const c = (i + 1) * lon_dim + (j + 1);
        const d = i * lon_dim + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [gridData, depth, cmapName]);

  if (!layerVisibility.gridded || !meshGeometry) {
    return null;
  }

  return (
    <group>
      <mesh geometry={meshGeometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>
    </group>
  );
}
