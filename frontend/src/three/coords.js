/**
 * Geographic to Three.js coordinate projection
 * Centered around Indian Ocean basin (Lon 75°E, Lat 10°N)
 */
export const COORD_CONFIG = {
  centerLon: 75.0,
  centerLat: 10.0,
  scaleX: 0.7,
  scaleZ: 0.7,
  maxDepth: 2000.0,
  depthScale: 6.0, // surface at Y=0, 2000m at Y=-6.0
};

export function geoToThree(lat, lon, depth = 0) {
  const x = (lon - COORD_CONFIG.centerLon) * COORD_CONFIG.scaleX;
  const z = -(lat - COORD_CONFIG.centerLat) * COORD_CONFIG.scaleZ;
  const y = -(Math.min(COORD_CONFIG.maxDepth, Math.max(0, depth)) / COORD_CONFIG.maxDepth) * COORD_CONFIG.depthScale;
  return [x, y, z];
}

export function threeToGeo(x, y, z) {
  const lon = x / COORD_CONFIG.scaleX + COORD_CONFIG.centerLon;
  const lat = -z / COORD_CONFIG.scaleZ + COORD_CONFIG.centerLat;
  const depth = (-y / COORD_CONFIG.depthScale) * COORD_CONFIG.maxDepth;
  return { lat, lon, depth: Math.max(0, depth) };
}
