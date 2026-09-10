import { useMemo } from 'react';
import * as THREE from 'three';
import { sampleColormap } from '../utils/colormaps';

const BLOCK_SIZE = 10.0;
const MAX_DEPTH = 2000.0;
const BLOCK_HEIGHT = 8.0;

function createHeatmapTexture(gridData, cmapName) {
  if (!gridData || !gridData.lat_dim || !gridData.lon_dim || !gridData.values) {
    return null;
  }

  const { lat_dim, lon_dim, values, min_val, max_val } = gridData;
  const span = (max_val - min_val) || 1.0;

  // Use an offscreen canvas to generate the heatmap texture from real returned grid data
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(lon_dim, 2);
  canvas.height = Math.max(lat_dim, 2);
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < lat_dim; i++) {
    // In Canvas 2D, row 0 is top. In geography, higher latitude is north (top).
    const rowIdx = (lat_dim - 1 - i);
    for (let j = 0; j < lon_dim; j++) {
      const val = values[i * lon_dim + j];
      const pixelIdx = (rowIdx * lon_dim + j) * 4;

      if (val !== null && val !== undefined && !isNaN(val)) {
        const norm = Math.max(0, Math.min(1, (val - min_val) / span));
        const c = sampleColormap(norm, cmapName);
        imgData.data[pixelIdx] = Math.round(c.r * 255);
        imgData.data[pixelIdx + 1] = Math.round(c.g * 255);
        imgData.data[pixelIdx + 2] = Math.round(c.b * 255);
        imgData.data[pixelIdx + 3] = 230; // 90% opacity
      } else {
        // Missing data in mask
        imgData.data[pixelIdx] = 15;
        imgData.data[pixelIdx + 1] = 23;
        imgData.data[pixelIdx + 2] = 42;
        imgData.data[pixelIdx + 3] = 120;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return texture;
}

export default function BlockScalarLayer({ gridData, depth, isActive, variable = 'temperature' }) {
  const cmapName = variable === 'salinity' ? 'haline' : 'turbo';

  const texture = useMemo(() => {
    return createHeatmapTexture(gridData, cmapName);
  }, [gridData, cmapName]);

  const yPos = -(Math.min(MAX_DEPTH, Math.max(0, depth)) / MAX_DEPTH) * BLOCK_HEIGHT;

  if (!texture) return null;

  return (
    <group position={[0, yPos, 0]}>
      {/* Horizontal Gridded Scalar Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BLOCK_SIZE, BLOCK_SIZE]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={isActive ? 0.9 : 0.28}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.1}
          depthWrite={isActive}
        />
      </mesh>

      {/* Active Depth Layer Outline Frame */}
      {isActive && (
        <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE)]} />
          <lineBasicMaterial color="#38bdf8" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}
