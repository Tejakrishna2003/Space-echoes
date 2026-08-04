import * as THREE from 'three';

export function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function createStarfieldTiers(scene, trackResource, starTexture) {
  const createStarTier = (count, pointSize, opacityVal) => {
    const geo = trackResource(new THREE.BufferGeometry());
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1000 + Math.random() * 300;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const starType = Math.random();
      const col = new THREE.Color();
      if (starType < 0.60) {
        col.setHSL(0.11 + Math.random() * 0.04, 0.7, 0.75 + Math.random() * 0.2); // Warm yellow-white
      } else if (starType < 0.85) {
        col.setHSL(0.58 + Math.random() * 0.08, 0.8, 0.8 + Math.random() * 0.2);  // Cool blue-white
      } else {
        col.setHSL(0.02 + Math.random() * 0.03, 0.9, 0.65 + Math.random() * 0.2); // Red Giant
      }
      cols[i * 3] = col.r;
      cols[i * 3 + 1] = col.g;
      cols[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const mat = trackResource(new THREE.PointsMaterial({
      size: pointSize * 1.6,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: opacityVal,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    scene.add(new THREE.Points(geo, mat));
  };

  // Layer A: 16,000 faint background stars
  createStarTier(16000, 0.9, 0.75);
  // Layer B: 3,000 medium magnitude stars
  createStarTier(3000, 1.8, 0.85);
  // Layer C: 1,000 bright named magnitude stars
  createStarTier(1000, 3.0, 0.95);
}

export function createConstellationsGroup(scene, trackResource) {
  const group = new THREE.Group();
  group.visible = false;
  const mat = trackResource(new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  }));

  const constellationData = [
    // Orion (Hunter)
    [
      [-80, 120, -600], [-30, 90, -600], [40, 110, -600],
      [-10, 20, -600], [0, 20, -600], [10, 20, -600],
      [-40, -70, -600], [30, -80, -600]
    ],
    // Ursa Major (Big Dipper)
    [
      [-300, 400, -500], [-230, 430, -500], [-170, 410, -500],
      [-120, 350, -500], [-130, 280, -500], [-210, 290, -500], [-230, 360, -500]
    ],
    // Cassiopeia (W-Shape)
    [
      [200, 500, -450], [260, 560, -450], [310, 520, -450], [370, 570, -450], [420, 510, -450]
    ],
    // Scorpius (Scorpion)
    [
      [-400, -200, -550], [-350, -180, -550], [-300, -210, -550], [-260, -270, -550],
      [-280, -340, -550], [-340, -370, -550], [-380, -340, -550]
    ]
  ];

  constellationData.forEach(stars => {
    const points = stars.map(s => new THREE.Vector3(s[0], s[1], s[2]));
    const geo = trackResource(new THREE.BufferGeometry().setFromPoints(points));
    group.add(new THREE.Line(geo, mat));

    stars.forEach(s => {
      const sGeo = trackResource(new THREE.SphereGeometry(0.8, 8, 8));
      const sMat = trackResource(new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8 }));
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.position.set(s[0], s[1], s[2]);
      group.add(sMesh);
    });
  });

  scene.add(group);
  return group;
}
