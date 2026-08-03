import * as THREE from 'three';

/**
 * 4096x2048 Ultra-HD Photorealistic NASA Earth — 7 Continents, 5 Oceans, Specular, Night, Bump & Clouds
 * Version 11 — High-Fidelity Topographic Relief Bump Map & 4K Texture Resolution
 */

const textureCache = new Map();

function createNoiseCanvas(cacheKey, width, height, drawFn) {
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUN SURFACE TEXTURE
// ─────────────────────────────────────────────────────────────────────────────
export function getSunTexture() {
  return createNoiseCanvas('sun_v6_2048', 2048, 1024, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#ff9900');
    grad.addColorStop(0.35, '#ff4400');
    grad.addColorStop(0.7, '#ff6600');
    grad.addColorStop(1, '#cc1100');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 20 + 3;
      const sg = ctx.createRadialGradient(x, y, 0, x, y, r);
      sg.addColorStop(0, 'rgba(255,255,230,0.95)');
      sg.addColorStop(0.4, 'rgba(255,130,0,0.7)');
      sg.addColorStop(0.8, 'rgba(200,30,0,0.3)');
      sg.addColorStop(1, 'rgba(150,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    [
      { x: w * 0.25, y: h * 0.42, r: 32 },
      { x: w * 0.28, y: h * 0.45, r: 20 },
      { x: w * 0.62, y: h * 0.55, r: 38 },
      { x: w * 0.66, y: h * 0.52, r: 22 },
      { x: w * 0.84, y: h * 0.38, r: 26 }
    ].forEach(s => {
      const pg = ctx.createRadialGradient(s.x, s.y, s.r * 0.2, s.x, s.y, s.r);
      pg.addColorStop(0, '#220400'); pg.addColorStop(0.65, '#661a00'); pg.addColorStop(1, 'rgba(102,26,0,0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#080100';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.42, 0, Math.PI * 2); ctx.fill();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PHOTOREALISTIC EARTH ORGANIC SHAPES & GEOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

const ORGANIC_LANDMASSES = [
  // 1. NORTH AMERICA
  {
    name: 'North America Main',
    color: '#2d6a4f',
    seed: 1.1,
    nodes: [
      [0.08, 0.18], [0.15, 0.14], [0.26, 0.15], [0.36, 0.20], [0.33, 0.32],
      [0.28, 0.38], [0.26, 0.46], [0.22, 0.45], [0.18, 0.40], [0.14, 0.35], [0.08, 0.26]
    ]
  },
  {
    name: 'US Southwest Desert',
    color: '#d4a373',
    seed: 1.2,
    nodes: [
      [0.15, 0.35], [0.22, 0.35], [0.24, 0.42], [0.17, 0.43]
    ]
  },
  {
    name: 'Central America & Caribbean',
    color: '#1b4332',
    seed: 1.3,
    nodes: [
      [0.22, 0.45], [0.26, 0.48], [0.27, 0.53], [0.23, 0.50]
    ]
  },

  // 2. SOUTH AMERICA
  {
    name: 'Amazon Rainforest Core',
    color: '#143814',
    seed: 2.1,
    nodes: [
      [0.25, 0.53], [0.32, 0.52], [0.37, 0.58], [0.35, 0.70], [0.31, 0.82],
      [0.28, 0.86], [0.27, 0.75], [0.25, 0.62]
    ]
  },
  {
    name: 'Andes & South Deserts',
    color: '#3a5c30',
    seed: 2.2,
    nodes: [
      [0.25, 0.55], [0.27, 0.65], [0.28, 0.85], [0.26, 0.82]
    ]
  },

  // 3. EUROPE
  {
    name: 'Scandinavia & Europe',
    color: '#2d6a4f',
    seed: 3.1,
    nodes: [
      [0.48, 0.24], [0.55, 0.20], [0.59, 0.22], [0.58, 0.32], [0.54, 0.38],
      [0.48, 0.36], [0.46, 0.30]
    ]
  },
  {
    name: 'Iberia & Southern Europe',
    color: '#c29b38',
    seed: 3.2,
    nodes: [
      [0.46, 0.34], [0.52, 0.34], [0.52, 0.40], [0.46, 0.38]
    ]
  },

  // 4. AFRICA
  {
    name: 'Sahara Desert Core',
    color: '#e0c068',
    seed: 4.1,
    nodes: [
      [0.44, 0.38], [0.59, 0.36], [0.63, 0.44], [0.58, 0.50], [0.43, 0.48]
    ]
  },
  {
    name: 'Congo & Sub-Saharan Africa',
    color: '#143814',
    seed: 4.2,
    nodes: [
      [0.43, 0.48], [0.58, 0.50], [0.63, 0.56], [0.56, 0.75], [0.50, 0.76], [0.45, 0.62]
    ]
  },
  {
    name: 'Madagascar',
    color: '#2d6a4f',
    seed: 4.3,
    nodes: [
      [0.61, 0.62], [0.64, 0.62], [0.63, 0.72], [0.60, 0.72]
    ]
  },

  // 5. ASIA
  {
    name: 'Siberia Taiga North',
    color: '#2d5a27',
    seed: 5.1,
    nodes: [
      [0.59, 0.16], [0.75, 0.14], [0.90, 0.18], [0.88, 0.32], [0.78, 0.35],
      [0.68, 0.32], [0.59, 0.26]
    ]
  },
  {
    name: 'Arabia Desert Peninsula',
    color: '#d4a373',
    seed: 5.2,
    nodes: [
      [0.58, 0.40], [0.65, 0.40], [0.66, 0.50], [0.60, 0.52]
    ]
  },
  {
    name: 'India Subcontinent',
    color: '#2d6a4f',
    seed: 5.3,
    nodes: [
      [0.66, 0.43], [0.73, 0.43], [0.74, 0.56], [0.68, 0.58]
    ]
  },
  {
    name: 'Himalayan Ridge',
    color: '#f8f9fa',
    seed: 5.4,
    nodes: [
      [0.67, 0.40], [0.75, 0.40], [0.76, 0.43], [0.68, 0.43]
    ]
  },
  {
    name: 'East Asia & China Plains',
    color: '#1b4332',
    seed: 5.5,
    nodes: [
      [0.75, 0.32], [0.88, 0.30], [0.89, 0.48], [0.82, 0.56], [0.75, 0.48]
    ]
  },
  {
    name: 'Indonesia Archipelago',
    color: '#143814',
    seed: 5.6,
    nodes: [
      [0.78, 0.54], [0.88, 0.54], [0.88, 0.60], [0.78, 0.60]
    ]
  },

  // 6. AUSTRALIA & OCEANIA
  {
    name: 'Australia Outback Core',
    color: '#d4a373',
    seed: 6.1,
    nodes: [
      [0.78, 0.62], [0.88, 0.62], [0.90, 0.74], [0.80, 0.76]
    ]
  },
  {
    name: 'Australia East Coast Green',
    color: '#2d6a4f',
    seed: 6.2,
    nodes: [
      [0.86, 0.62], [0.90, 0.62], [0.90, 0.74], [0.86, 0.74]
    ]
  },

  // 7. ANTARCTICA
  {
    name: 'Antarctica Continent Base',
    color: '#f0f4f8',
    seed: 7.1,
    nodes: [
      [0.05, 0.88], [0.25, 0.86], [0.50, 0.87], [0.75, 0.85], [0.95, 0.88],
      [0.98, 0.96], [0.02, 0.96]
    ]
  },

  // GREENLAND
  {
    name: 'Greenland Ice Sheet',
    color: '#f8f9fa',
    seed: 8.1,
    nodes: [
      [0.33, 0.14], [0.41, 0.14], [0.42, 0.24], [0.34, 0.25]
    ]
  }
];

// Mountain Ridge Definitions for Topographic Relief Bump Map
const MOUNTAIN_RANGES = [
  { name: 'Himalayas', cx: 0.71, cy: 0.41, rx: 0.06, ry: 0.02, height: 1.0 },
  { name: 'Andes', cx: 0.27, cy: 0.70, rx: 0.015, ry: 0.12, height: 0.9 },
  { name: 'Rockies', cx: 0.18, cy: 0.30, rx: 0.02, ry: 0.08, height: 0.85 },
  { name: 'Alps', cx: 0.54, cy: 0.34, rx: 0.03, ry: 0.015, height: 0.8 },
  { name: 'Great Dividing Range', cx: 0.88, cy: 0.68, rx: 0.015, ry: 0.06, height: 0.7 }
];

function drawOrganicLandmass(ctx, nodes, w, h, color, seed = 1.0) {
  if (!nodes || nodes.length < 3) return;
  ctx.fillStyle = color;
  ctx.beginPath();

  const points = nodes.map(([nx, ny], idx) => {
    const noiseX = Math.sin(idx * 7.3 + seed * 13.7) * 0.012;
    const noiseY = Math.cos(idx * 5.9 + seed * 11.3) * 0.012;
    return [ (nx + noiseX) * w, (ny + noiseY) * h ];
  });

  const total = points.length;
  const midStartX = (points[total - 1][0] + points[0][0]) / 2;
  const midStartY = (points[total - 1][1] + points[0][1]) / 2;
  ctx.moveTo(midStartX, midStartY);

  for (let i = 0; i < total; i++) {
    const pCurrent = points[i];
    const pNext = points[(i + 1) % total];
    const midX = (pCurrent[0] + pNext[0]) / 2;
    const midY = (pCurrent[1] + pNext[1]) / 2;
    ctx.quadraticCurveTo(pCurrent[0], pCurrent[1], midX, midY);
  }

  ctx.closePath();
  ctx.fill();
}

// 4K Ultra-HD NASA Base Color Texture
export function getEarthTexture() {
  return createNoiseCanvas('earth_v11_4096', 4096, 2048, (ctx, w, h) => {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#001a33');
    oceanGrad.addColorStop(0.3, '#002952');
    oceanGrad.addColorStop(0.5, '#0f3866');
    oceanGrad.addColorStop(0.7, '#002952');
    oceanGrad.addColorStop(1, '#001a33');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    const atlGrad = ctx.createLinearGradient(w * 0.25, 0, w * 0.50, h);
    atlGrad.addColorStop(0, '#001c38');
    atlGrad.addColorStop(0.5, '#003366');
    atlGrad.addColorStop(1, '#001a33');
    ctx.fillStyle = atlGrad;
    ctx.fillRect(w * 0.25, h * 0.10, w * 0.25, h * 0.78);

    const indGrad = ctx.createRadialGradient(w * 0.68, h * 0.60, 0, w * 0.68, h * 0.60, w * 0.22);
    indGrad.addColorStop(0, '#004c99');
    indGrad.addColorStop(1, '#002952');
    ctx.fillStyle = indGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.60, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    [
      { x: w * 0.25, y: h * 0.46, rx: w * 0.04, ry: h * 0.04 },
      { x: w * 0.86, y: h * 0.65, rx: w * 0.05, ry: h * 0.04 },
      { x: w * 0.55, y: h * 0.38, rx: w * 0.03, ry: h * 0.03 },
      { x: w * 0.79, y: h * 0.52, rx: w * 0.06, ry: h * 0.05 },
      { x: w * 0.62, y: h * 0.46, rx: w * 0.02, ry: h * 0.02 },
    ].forEach(r => {
      const rg = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, Math.max(r.rx, r.ry));
      rg.addColorStop(0, '#48cae4');
      rg.addColorStop(0.5, '#0096c7');
      rg.addColorStop(1, 'rgba(0, 41, 82, 0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ORGANIC_LANDMASSES.forEach(land => {
      drawOrganicLandmass(ctx, land.nodes, w, h, land.color, land.seed);
    });

    ctx.fillStyle = '#2d6a4f';
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * w;
      const y = h * 0.16 + Math.random() * h * 0.68;
      const rx = Math.random() * 25 + 4;
      const ry = Math.random() * 10 + 3;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// 3. 4K Ultra-HD NASA Specular Reflectivity Map
export function getEarthSpecularMap() {
  return createNoiseCanvas('earth_specular_v11_4096', 4096, 2048, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ORGANIC_LANDMASSES.forEach(land => {
      drawOrganicLandmass(ctx, land.nodes, w, h, '#000000', land.seed);
    });

    ctx.fillStyle = '#777777';
    ctx.fillRect(0, h * 0.88, w, h * 0.12);
    ctx.fillRect(0, 0, w, h * 0.10);
  });
}

// 4. NEW: Topographic Elevation Relief Bump Map for 3D Mountain Terrain
export function getEarthBumpMap() {
  return createNoiseCanvas('earth_bump_v11_4096', 4096, 2048, (ctx, w, h) => {
    // Ocean = Black #000000 (Flat Level)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Landmass Base = Dark Grey #333333 (Low Plateau)
    ORGANIC_LANDMASSES.forEach(land => {
      drawOrganicLandmass(ctx, land.nodes, w, h, '#333333', land.seed);
    });

    // Mountain Ranges = Bright White Height Bulges #ffffff
    MOUNTAIN_RANGES.forEach(m => {
      const mx = m.cx * w;
      const my = m.cy * h;
      const mrx = m.rx * w;
      const mry = m.ry * h;

      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(mrx, mry));
      mg.addColorStop(0, '#ffffff');
      mg.addColorStop(0.5, '#aaaaaa');
      mg.addColorStop(1, 'rgba(51, 51, 51, 0)');

      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(mx, my, mrx, mry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

// 5. 4K NASA Black Marble City Lights
export function getEarthNightTexture() {
  return createNoiseCanvas('earth_night_v11_4096', 4096, 2048, (ctx, w, h) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const drawCityCluster = (cx, cy, count, radius) => {
      ctx.fillStyle = '#ffe066';
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(Math.random()) * radius;
        const theta = Math.random() * Math.PI * 2;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        const sz = Math.random() * 3.0 + 1.0;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawCityCluster(w * 0.25, h * 0.35, 220, 70);
    drawCityCluster(w * 0.16, h * 0.38, 140, 50);
    drawCityCluster(w * 0.54, h * 0.28, 280, 80);
    drawCityCluster(w * 0.70, h * 0.48, 240, 75);
    drawCityCluster(w * 0.82, h * 0.38, 300, 85);
    drawCityCluster(w * 0.87, h * 0.36, 160, 45);
    drawCityCluster(w * 0.32, h * 0.65, 120, 50);
    drawCityCluster(w * 0.85, h * 0.72, 100, 45);
  });
}

// 6. 4K Ultra-HD Procedural Clouds
export function getEarthCloudTexture() {
  return createNoiseCanvas('earth_clouds_v11_4096', 4096, 2048, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 300; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const rx = Math.random() * 300 + 80;
      const ry = Math.random() * 24 + 6;
      const alpha = 0.18 + Math.random() * 0.28;
      
      const cloudGrad = ctx.createRadialGradient(x, y, 0, x, y, rx);
      cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      cloudGrad.addColorStop(0.8, `rgba(255, 255, 255, ${alpha * 0.4})`);
      cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = cloudGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// OTHER PLANET TEXTURES (Mars, Jupiter, Saturn, Moon, Venus, Ice Giants)
// ─────────────────────────────────────────────────────────────────────────────
export function getMarsTexture() {
  return createNoiseCanvas('mars_2048', 2048, 1024, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#b7410e'); grad.addColorStop(0.5, '#d9531e'); grad.addColorStop(1, '#8f2d05');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#4a1400';
    for (let i = 0; i < 350; i++) {
      ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 80 + 15, Math.random() * 40 + 8, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    const mg = ctx.createRadialGradient(w * 0.4, h * 0.45, 5, w * 0.4, h * 0.45, 60);
    mg.addColorStop(0, '#ff7733'); mg.addColorStop(0.5, '#993300'); mg.addColorStop(1, '#d9531e');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(w * 0.4, h * 0.45, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h * 0.08); ctx.fillRect(0, h * 0.92, w, h * 0.08);
  });
}

export function getJupiterTexture() {
  return createNoiseCanvas('jupiter_2048', 2048, 1024, (ctx, w, h) => {
    const bands = ['#c8965f','#4a2c11','#e3c099','#844e23','#d4b58c','#5c3317','#e3c099','#3d1e0a','#c8965f','#6e3c19','#dfba91','#4a220b'];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * (h / bands.length), w, h / bands.length); });
    const sg = ctx.createRadialGradient(w * 0.65, h * 0.6, 5, w * 0.65, h * 0.6, 80);
    sg.addColorStop(0, '#b32400'); sg.addColorStop(0.6, '#7a1800'); sg.addColorStop(1, '#e3c099');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(w * 0.65, h * 0.6, 95, 55, 0, 0, Math.PI * 2); ctx.fill();
  });
}

export function getSaturnTexture() {
  return createNoiseCanvas('saturn_2048', 2048, 1024, (ctx, w, h) => {
    const bands = ['#e2c275','#9e823b','#f7df9e','#7a6325','#e2c275','#b39544','#f7df9e','#806827'];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * (h / bands.length), w, h / bands.length); });
  });
}

export function getSaturnRingTexture() {
  return createNoiseCanvas('saturn_ring_1024', 1024, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let x = 0; x < w; x++) {
      const n = x / w;
      let a = n > 0.65 && n < 0.72 ? 0.04 : (n > 0.4 && n < 0.45 ? 0.4 : 0.6 + Math.sin(n * 100) * 0.3);
      ctx.fillStyle = '#e2c275';
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.fillRect(x, 0, 1, h);
    }
    ctx.globalAlpha = 1;
  });
}

export function getMoonTexture() {
  return createNoiseCanvas('moon_2048', 2048, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#d8d8d8'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#555555';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 120 + 30, Math.random() * 80 + 20, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#333333';
    for (let i = 0; i < 450; i++) {
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 18 + 3, 0, Math.PI * 2); ctx.fill();
    }
  });
}
export function getCraterTexture() { return getMoonTexture(); }

export function getVenusTexture() {
  return createNoiseCanvas('venus_2048', 2048, 1024, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e6b800'); grad.addColorStop(0.5, '#c49500'); grad.addColorStop(1, '#8c6800');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,230,150,0.4)';
    for (let i = 0; i < 350; i++) {
      ctx.beginPath(); ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 140 + 30, Math.random() * 30 + 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
}

export function getIceGiantTexture(color1, color2) {
  return createNoiseCanvas(`ice_${color1}_${color2}`, 2048, 1024, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color1); grad.addColorStop(0.5, color2); grad.addColorStop(1, color1);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  });
}
