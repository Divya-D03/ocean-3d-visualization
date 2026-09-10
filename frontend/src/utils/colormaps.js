import * as THREE from 'three';

// Scientific colormaps definitions (samples along [0, 1])
export const COLORMAPS = {
  turbo: [
    { t: 0.00, r: 0.19, g: 0.07, b: 0.23 },
    { t: 0.15, r: 0.23, g: 0.32, b: 0.74 },
    { t: 0.30, r: 0.14, g: 0.58, b: 0.88 },
    { t: 0.45, r: 0.17, g: 0.79, b: 0.60 },
    { t: 0.60, r: 0.56, g: 0.89, b: 0.24 },
    { t: 0.75, r: 0.95, g: 0.78, b: 0.15 },
    { t: 0.90, r: 0.98, g: 0.42, b: 0.11 },
    { t: 1.00, r: 0.62, g: 0.13, b: 0.05 },
  ],
  viridis: [
    { t: 0.00, r: 0.27, g: 0.00, b: 0.33 },
    { t: 0.25, r: 0.28, g: 0.29, b: 0.55 },
    { t: 0.50, r: 0.13, g: 0.57, b: 0.55 },
    { t: 0.75, r: 0.43, g: 0.81, b: 0.35 },
    { t: 1.00, r: 0.99, g: 0.91, b: 0.14 },
  ],
  haline: [
    { t: 0.00, r: 0.18, g: 0.16, b: 0.54 },
    { t: 0.25, r: 0.15, g: 0.45, b: 0.68 },
    { t: 0.50, r: 0.22, g: 0.70, b: 0.60 },
    { t: 0.75, r: 0.73, g: 0.88, b: 0.45 },
    { t: 1.00, r: 0.98, g: 0.98, b: 0.65 },
  ],
  speed: [
    { t: 0.00, r: 0.05, g: 0.25, b: 0.55 },
    { t: 0.30, r: 0.10, g: 0.65, b: 0.75 },
    { t: 0.65, r: 0.95, g: 0.80, b: 0.20 },
    { t: 1.00, r: 0.95, g: 0.20, b: 0.10 },
  ],
};

export function sampleColormap(normVal, cmapName = 'turbo') {
  const cmap = COLORMAPS[cmapName] || COLORMAPS.turbo;
  const t = Math.max(0, Math.min(1, normVal));

  for (let i = 0; i < cmap.length - 1; i++) {
    const c1 = cmap[i];
    const c2 = cmap[i + 1];
    if (t >= c1.t && t <= c2.t) {
      const alpha = (t - c1.t) / (c2.t - c1.t);
      const r = c1.r + alpha * (c2.r - c1.r);
      const g = c1.g + alpha * (c2.g - c1.g);
      const b = c1.b + alpha * (c2.b - c1.b);
      return new THREE.Color(r, g, b);
    }
  }
  const last = cmap[cmap.length - 1];
  return new THREE.Color(last.r, last.g, last.b);
}

export function getColorHex(normVal, cmapName = 'turbo') {
  const c = sampleColormap(normVal, cmapName);
  return '#' + c.getHexString();
}

export function getColormapCSSGradient(cmapName = 'turbo') {
  const cmap = COLORMAPS[cmapName] || COLORMAPS.turbo;
  const stops = cmap.map((pt) => {
    const pct = Math.round(pt.t * 100);
    const r = Math.round(pt.r * 255);
    const g = Math.round(pt.g * 255);
    const b = Math.round(pt.b * 255);
    return `rgb(${r}, ${g}, ${b}) ${pct}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
