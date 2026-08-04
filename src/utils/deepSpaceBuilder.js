import * as THREE from 'three';

/**
 * Modular Deep Space Object Builder Helpers
 */

// 1. Constellations Builder
export function buildConstellations(starTexture, trackResource) {
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

  return group;
}

// 2. Milky Way Galaxy Builder
export function buildMilkyWay(starTexture, trackResource, spaceData) {
  const galaxyGroup = new THREE.Group();
  galaxyGroup.position.set(0, -180, -350);

  galaxyGroup.add(new THREE.PointLight(0xffea9f, 1.5, 80));
  galaxyGroup.add(new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(3.5, 32, 32)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0xfff4cc, transparent: true, opacity: 0.35, depthWrite: false }))
  ));

  const starCount = 35000;
  const starGeo = trackResource(new THREE.BufferGeometry());
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const isBulgeBar = i < 8000;
    let x, y, z;
    const mixedColor = new THREE.Color();

    if (isBulgeBar) {
      const r = Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      x = Math.cos(theta) * r * 1.8 + (Math.random() - 0.5) * 2;
      y = (Math.random() - 0.5) * (r * 0.4);
      z = Math.sin(theta) * r * 0.7 + (Math.random() - 0.5) * 2;
      mixedColor.setHSL(0.08 + Math.random() * 0.08, 0.9, 0.65 + Math.random() * 0.2);
    } else {
      const r = 12 + Math.random() * 110;
      const spinAngle = r * 0.12;
      const armsCount = 4;
      const armOffset = (i % armsCount) * ((Math.PI * 2) / armsCount);

      x = Math.cos(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.12);
      y = (Math.random() - 0.5) * (r * 0.12);
      z = Math.sin(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.12);

      const starRand = Math.random();
      if (r < 40) {
        mixedColor.setHSL(0.10 + Math.random() * 0.05, 0.8, 0.72 + Math.random() * 0.2);
      } else if (starRand < 0.15) {
        mixedColor.setHSL(0.02 + Math.random() * 0.03, 0.9, 0.65 + Math.random() * 0.2);
      } else {
        mixedColor.setHSL(0.57 + Math.random() * 0.09, 0.85, 0.78 + Math.random() * 0.2);
      }
    }

    starPos[i * 3] = x;
    starPos[i * 3 + 1] = y;
    starPos[i * 3 + 2] = z;

    starColors[i * 3] = mixedColor.r;
    starColors[i * 3 + 1] = mixedColor.g;
    starColors[i * 3 + 2] = mixedColor.b;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  galaxyGroup.add(new THREE.Points(starGeo, trackResource(new THREE.PointsMaterial({
    size: 0.6,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))));

  // Sagittarius A* Core Engine (Supermassive Black Hole Nucleus)
  const sagAAccretionGeo = trackResource(new THREE.SphereGeometry(1.8, 32, 32));
  const sagAAccretionMat = trackResource(new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
  const sagittariusACoreMesh = new THREE.Mesh(sagAAccretionGeo, sagAAccretionMat);
  galaxyGroup.add(sagittariusACoreMesh);

  const sagAHaloGeo = trackResource(new THREE.RingGeometry(2.0, 4.5, 32));
  const sagAHaloMat = trackResource(new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending }));
  const sagAHalo = new THREE.Mesh(sagAHaloGeo, sagAHaloMat);
  sagAHalo.rotation.x = Math.PI / 2;
  sagittariusACoreMesh.add(sagAHalo);

  return { galaxyGroup, sagittariusACoreMesh };
}

// 3. Orion Nebula Builder
export function buildOrionNebula(starTexture, trackResource, spaceData) {
  const nebulaGroup = new THREE.Group();
  nebulaGroup.position.set(120, 20, -180);

  const nebParticleCount = 4500;
  const nebGeo = trackResource(new THREE.BufferGeometry());
  const nebPos = new Float32Array(nebParticleCount * 3);
  const nebCols = new Float32Array(nebParticleCount * 3);

  for (let i = 0; i < nebParticleCount; i++) {
    const lobe = i < nebParticleCount * 0.5 ? -1 : 1;
    const r = 12 + Math.random() * 28;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    nebPos[i * 3] = (r * Math.sin(phi) * Math.cos(theta)) + lobe * 12;
    nebPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
    nebPos[i * 3 + 2] = r * Math.cos(phi);

    const nebRand = Math.random();
    const col = new THREE.Color();
    if (nebRand < 0.55) {
      col.setHSL(0.80 + Math.random() * 0.10, 0.95, 0.58 + Math.random() * 0.25);
    } else if (nebRand < 0.85) {
      col.setHSL(0.50 + Math.random() * 0.08, 0.90, 0.62 + Math.random() * 0.2);
    } else {
      col.setHSL(0.02 + Math.random() * 0.04, 0.90, 0.65 + Math.random() * 0.2);
    }
    nebCols[i * 3] = col.r;
    nebCols[i * 3 + 1] = col.g;
    nebCols[i * 3 + 2] = col.b;
  }
  nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
  nebGeo.setAttribute('color', new THREE.BufferAttribute(nebCols, 3));

  nebulaGroup.add(new THREE.Points(nebGeo, trackResource(new THREE.PointsMaterial({
    size: 2.2,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))));

  const nebCoreCount = 1200;
  const nebCoreGeo = trackResource(new THREE.BufferGeometry());
  const nebCorePos = new Float32Array(nebCoreCount * 3);
  const nebCoreCols = new Float32Array(nebCoreCount * 3);
  for (let i = 0; i < nebCoreCount; i++) {
    const cr = Math.random() * 8;
    const cTheta = Math.random() * Math.PI * 2;
    const cPhi = Math.random() * Math.PI;
    nebCorePos[i * 3] = cr * Math.sin(cPhi) * Math.cos(cTheta);
    nebCorePos[i * 3 + 1] = cr * Math.sin(cPhi) * Math.sin(cTheta);
    nebCorePos[i * 3 + 2] = cr * Math.cos(cPhi);
    const cc = new THREE.Color().setHSL(0.78 + Math.random() * 0.08, 1.0, 0.82 + Math.random() * 0.18);
    nebCoreCols[i * 3] = cc.r; nebCoreCols[i * 3 + 1] = cc.g; nebCoreCols[i * 3 + 2] = cc.b;
  }
  nebCoreGeo.setAttribute('position', new THREE.BufferAttribute(nebCorePos, 3));
  nebCoreGeo.setAttribute('color', new THREE.BufferAttribute(nebCoreCols, 3));
  nebulaGroup.add(new THREE.Points(nebCoreGeo, trackResource(new THREE.PointsMaterial({
    size: 3.5,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))));

  const trapeziumStarsGroup = new THREE.Group();
  [
    [-1.5, 1.0, 0.5], [1.8, -1.2, -0.4], [-0.8, -1.5, 1.0], [1.2, 1.6, -0.8]
  ].forEach(p => {
    const starMesh = new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(0.6, 16, 16)),
      trackResource(new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 }))
    );
    starMesh.position.set(p[0], p[1], p[2]);
    trapeziumStarsGroup.add(starMesh);

    const pLight = new THREE.PointLight(0x38bdf8, 2.0, 40);
    pLight.position.set(p[0], p[1], p[2]);
    trapeziumStarsGroup.add(pLight);
  });
  nebulaGroup.add(trapeziumStarsGroup);

  return { nebulaGroup, trapeziumStarsGroup };
}

// 4. Andromeda Galaxy Builder
export function buildAndromeda(starTexture, trackResource, spaceData) {
  const androGroup = new THREE.Group();
  androGroup.position.set(-160, 40, -220);

  const androStarCount = 20000;
  const androGeo = trackResource(new THREE.BufferGeometry());
  const androPos = new Float32Array(androStarCount * 3);
  const androCols = new Float32Array(androStarCount * 3);

  for (let i = 0; i < androStarCount; i++) {
    const androColor = new THREE.Color();
    const isBulge = i < 4000;
    let x, y, z;

    if (isBulge) {
      const r = Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      x = Math.cos(theta) * r + (Math.random() - 0.5) * 2;
      y = (Math.random() - 0.5) * (r * 0.35);
      z = Math.sin(theta) * r + (Math.random() - 0.5) * 2;
      androColor.setHSL(0.09 + Math.random() * 0.06, 0.9, 0.68 + Math.random() * 0.2);
    } else {
      const r = 10 + Math.random() * 58;
      const spinAngle = r * 0.10;
      const armsCount = 4;
      const armOffset = (i % armsCount) * ((Math.PI * 2) / armsCount);
      x = Math.cos(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.10);
      y = (Math.random() - 0.5) * (r * 0.09);
      z = Math.sin(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.10);

      const andRand = Math.random();
      if (andRand < 0.60) {
        androColor.setHSL(0.60 + Math.random() * 0.08, 0.80, 0.76 + Math.random() * 0.2);
      } else if (andRand < 0.85) {
        androColor.setHSL(0.08 + Math.random() * 0.05, 0.75, 0.70 + Math.random() * 0.2);
      } else {
        androColor.setHSL(0.01 + Math.random() * 0.03, 0.90, 0.62 + Math.random() * 0.2);
      }
    }

    androPos[i * 3] = x;
    androPos[i * 3 + 1] = y;
    androPos[i * 3 + 2] = z;

    androCols[i * 3] = androColor.r;
    androCols[i * 3 + 1] = androColor.g;
    androCols[i * 3 + 2] = androColor.b;
  }

  androGeo.setAttribute('position', new THREE.BufferAttribute(androPos, 3));
  androGeo.setAttribute('color', new THREE.BufferAttribute(androCols, 3));

  const androPoints = new THREE.Points(androGeo, trackResource(new THREE.PointsMaterial({
    size: 0.7,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })));
  androGroup.add(androPoints);

  // Satellite Dwarf Galaxies M32 & M110 orbiting Andromeda halo (aligned to tilted disk)
  [[-12, 1, -8], [28, -2, 18]].forEach((pos, idx) => {
    const dwarfGeo = trackResource(new THREE.BufferGeometry());
    const dCount = 600;
    const dPos = new Float32Array(dCount * 3);
    for (let j = 0; j < dCount; j++) {
      const dr = Math.random() * 4.5;
      const dt = Math.random() * Math.PI * 2;
      const dp = Math.random() * Math.PI;
      dPos[j * 3] = pos[0] + dr * Math.sin(dp) * Math.cos(dt);
      dPos[j * 3 + 1] = pos[1] + dr * Math.sin(dp) * Math.sin(dt) * 0.5;
      dPos[j * 3 + 2] = pos[2] + dr * Math.cos(dp);
    }
    dwarfGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dwarfMesh = new THREE.Points(dwarfGeo, trackResource(new THREE.PointsMaterial({
      size: 0.8,
      map: starTexture,
      color: idx === 0 ? 0xfff7d6 : 0xf1f5f9,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));
    androGroup.add(dwarfMesh);
  });

  return { androGroup, androPoints };
}

// 5. Supermassive Black Hole Builder
export function buildSupermassiveBlackHole(starTexture, trackResource, spaceData, getBlackHoleAccretionTexture) {
  const bhData = spaceData.blackhole;
  const bhGroup = new THREE.Group();
  bhGroup.position.set(220, 0, -120);

  // Singularity System tilted relative to deep space (inclined accretion plane)
  const singularitySystem = new THREE.Group();
  singularitySystem.rotation.x = Math.PI / 6.0; // Beautiful 30-degree tilt
  singularitySystem.rotation.z = -Math.PI / 12.0;
  bhGroup.add(singularitySystem);

  // Event Horizon Solid Black Sphere
  const eventHorizonMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(bhData.size, 64, 64)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0x000000 }))
  );
  singularitySystem.add(eventHorizonMesh);

  // Relativistic Accretion Ring (now flat inside tilted system)
  const blackHoleAccretionRing = new THREE.Mesh(
    trackResource(new THREE.RingGeometry(bhData.size * 1.4, bhData.size * 3.5, 64)),
    trackResource(new THREE.MeshStandardMaterial({
      map: getBlackHoleAccretionTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    }))
  );
  singularitySystem.add(blackHoleAccretionRing);

  // Gravitational Lensing Light Distortion Photon Ring Shell
  const gravitationalLensMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(bhData.size * 1.28, 32, 32)),
    trackResource(new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(0xff8800) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2);
          gl_FragColor = vec4(color, rim * 0.75);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    }))
  );
  singularitySystem.add(gravitationalLensMesh);

  // Relativistic Plasma Jets (1,200 particles shooting along local Y axis)
  const jetCount = 1200;
  const jetGeo = trackResource(new THREE.BufferGeometry());
  const jetPos = new Float32Array(jetCount * 3);
  const jetColors = new Float32Array(jetCount * 3);

  const jetPositions = [];
  const jetSpeeds = [];

  for (let i = 0; i < jetCount; i++) {
    const direction = i < jetCount * 0.5 ? 1 : -1;
    const height = Math.random() * 25.0;
    const radius = 0.2 + (height * 0.08);
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * radius;
    const y = height * direction;
    const z = Math.sin(angle) * radius;

    jetPos[i * 3] = x;
    jetPos[i * 3 + 1] = y;
    jetPos[i * 3 + 2] = z;

    // Glowing electric blue-violet plasma color
    const jetColor = new THREE.Color().setHSL(0.55 + Math.random() * 0.12, 1.0, 0.65 + Math.random() * 0.35);
    jetColors[i * 3] = jetColor.r;
    jetColors[i * 3 + 1] = jetColor.g;
    jetColors[i * 3 + 2] = jetColor.b;

    jetPositions.push({ x, y, z, baseRadius: radius, direction, heightVal: height });
    jetSpeeds.push(0.12 + Math.random() * 0.18);
  }

  jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
  jetGeo.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));

  const jetParticles = new THREE.Points(
    jetGeo,
    trackResource(new THREE.PointsMaterial({
      size: 0.65,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))
  );
  singularitySystem.add(jetParticles);

  return {
    bhGroup,
    blackHoleAccretionRing,
    jetGeo,
    jetPositions,
    jetSpeeds
  };
}

// 6. Comet Builder
export function buildComet(starTexture, trackResource) {
  const cometMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(0.35, 16, 16)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0xe0f2fe }))
  );

  const cometComaMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(0.85, 16, 16)),
    trackResource(new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))
  );
  cometMesh.add(cometComaMesh);

  const cometTailCount = 100;
  const cometTailGeo = trackResource(new THREE.BufferGeometry());
  const cometTailPos = new Float32Array(cometTailCount * 3);
  cometTailGeo.setAttribute('position', new THREE.BufferAttribute(cometTailPos, 3));
  const cometTailParticles = new THREE.Points(
    cometTailGeo,
    trackResource(new THREE.PointsMaterial({
      size: 0.8,
      map: starTexture,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))
  );

  return { cometMesh, cometComaMesh, cometTailGeo, cometTailParticles, cometTailCount };
}
