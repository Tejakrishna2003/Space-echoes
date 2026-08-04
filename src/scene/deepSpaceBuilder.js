import * as THREE from 'three';

export function createMilkyWayGalaxy(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects) {
  const starCount = 35000;
  const starGeo = trackResource(new THREE.BufferGeometry());
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const galaxyGroup = new THREE.Group();
  galaxyGroup.position.set(0, -180, -350);
  scene.add(galaxyGroup);

  galaxyGroup.add(new THREE.PointLight(0xffea9f, 1.5, 80));
  galaxyGroup.add(new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(3.5, 32, 32)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0xfff4cc, transparent: true, opacity: 0.35, depthWrite: false }))
  ));

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

  const sagAAccretionGeo = trackResource(new THREE.SphereGeometry(1.8, 32, 32));
  const sagAAccretionMat = trackResource(new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
  const sagittariusACoreMesh = new THREE.Mesh(sagAAccretionGeo, sagAAccretionMat);
  galaxyGroup.add(sagittariusACoreMesh);

  const sagAHaloGeo = trackResource(new THREE.RingGeometry(2.0, 4.5, 32));
  const sagAHaloMat = trackResource(new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending }));
  const sagAHalo = new THREE.Mesh(sagAHaloGeo, sagAHaloMat);
  sagAHalo.rotation.x = Math.PI / 2;
  sagittariusACoreMesh.add(sagAHalo);

  const galaxyTargetMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(6.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
  galaxyTargetMesh.position.copy(galaxyGroup.position);
  galaxyTargetMesh.userData = { key: 'galaxy', data: SPACE_DATA.galaxy };
  scene.add(galaxyTargetMesh);
  planetMeshes.galaxy = galaxyTargetMesh;
  interactiveObjects.push(galaxyTargetMesh);

  return { galaxyGroup, sagittariusACoreMesh };
}

export function createOrionNebula(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects) {
  const nebulaData = SPACE_DATA.nebula;
  const nebulaGroup = new THREE.Group();
  nebulaGroup.position.set(120, 20, -180);
  scene.add(nebulaGroup);

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
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending
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

  const nebulaTargetMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(6.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
  nebulaTargetMesh.position.copy(nebulaGroup.position);
  nebulaTargetMesh.userData = { key: 'nebula', data: nebulaData };
  scene.add(nebulaTargetMesh);
  planetMeshes.nebula = nebulaTargetMesh;
  interactiveObjects.push(nebulaTargetMesh);

  return { nebulaGroup, trapeziumStarsGroup };
}

export function createAndromedaGalaxy(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects) {
  const androData = SPACE_DATA.andromeda;
  const androGroup = new THREE.Group();
  androGroup.position.set(-160, 40, -220);
  scene.add(androGroup);

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
      x = Math.cos(theta) * r * 1.5 + (Math.random() - 0.5) * 2;
      y = (Math.random() - 0.5) * (r * 0.35);
      z = Math.sin(theta) * r * 0.8 + (Math.random() - 0.5) * 2;
      androColor.setHSL(0.09 + Math.random() * 0.06, 0.9, 0.68 + Math.random() * 0.2);
    } else {
      const r = 10 + Math.random() * 58;
      const spinAngle = r * 0.10;
      const armsCount = 4;
      const armOffset = (i % armsCount) * ((Math.PI * 2) / armsCount);
      x = Math.cos(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.10);
      y = (Math.random() - 0.5) * (r * 0.09);
      z = Math.sin(armOffset + spinAngle) * r * 0.55 + (Math.random() - 0.5) * (r * 0.08);

      const andRand = Math.random();
      if (andRand < 0.60) {
        androColor.setHSL(0.60 + Math.random() * 0.08, 0.80, 0.76 + Math.random() * 0.2);
      } else if (andRand < 0.85) {
        androColor.setHSL(0.10 + Math.random() * 0.05, 0.75, 0.72 + Math.random() * 0.2);
      } else {
        androColor.setHSL(0.02 + Math.random() * 0.03, 0.9, 0.65 + Math.random() * 0.15);
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

  androGroup.add(new THREE.Points(androGeo, trackResource(new THREE.PointsMaterial({
    size: 0.7,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))));

  [[-25, 12, 10], [30, -18, -15]].forEach((pos, idx) => {
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
      color: idx === 0 ? 0xfef08a : 0x7dd3fc,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));
    androGroup.add(dwarfMesh);
  });

  const androTargetMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(6.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
  androTargetMesh.position.copy(androGroup.position);
  androTargetMesh.userData = { key: 'andromeda', data: androData };
  scene.add(androTargetMesh);
  planetMeshes.andromeda = androTargetMesh;
  interactiveObjects.push(androTargetMesh);

  return androGroup;
}

export function createSupermassiveBlackHole(scene, trackResource, SPACE_DATA, getBlackHoleAccretionTexture, planetMeshes, interactiveObjects) {
  const bhData = SPACE_DATA.blackhole;
  const bhGroup = new THREE.Group();
  bhGroup.position.set(220, 0, -120);
  scene.add(bhGroup);

  const eventHorizonMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(bhData.size, 64, 64)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0x000000 }))
  );
  bhGroup.add(eventHorizonMesh);

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
  blackHoleAccretionRing.rotation.x = Math.PI / 2.2;
  bhGroup.add(blackHoleAccretionRing);

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
  bhGroup.add(gravitationalLensMesh);

  const bhTargetMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(5.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
  bhTargetMesh.position.copy(bhGroup.position);
  bhTargetMesh.userData = { key: 'blackhole', data: bhData };
  scene.add(bhTargetMesh);
  planetMeshes.blackhole = bhTargetMesh;
  interactiveObjects.push(bhTargetMesh);

  return { bhGroup, blackHoleAccretionRing };
}

export function createKuiperBeltAndOortCloud(scene, trackResource, starTexture, SPACE_DATA, dummy, planetMeshes, interactiveObjects) {
  const kuiperData = SPACE_DATA.kuiperbelt;

  const kuiperRingMesh = new THREE.Mesh(
    trackResource(new THREE.RingGeometry(62.0 - 0.05, 62.0 + 0.05, 128)),
    trackResource(new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
      depthWrite: false
    }))
  );
  kuiperRingMesh.rotation.x = Math.PI / 2;
  scene.add(kuiperRingMesh);

  const kuiperCount = 1600;
  const kuiperGeo = trackResource(new THREE.DodecahedronGeometry(0.12, 0));
  const kuiperMat = trackResource(new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.6,
    metalness: 0.1
  }));
  const instancedKuiper = new THREE.InstancedMesh(kuiperGeo, kuiperMat, kuiperCount);

  const kuiperList = [];
  for (let i = 0; i < kuiperCount; i++) {
    const radius = 60.0 + Math.random() * 10.0;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.5;
    const rot = new THREE.Euler(Math.random(), Math.random(), Math.random());

    kuiperList.push({ radius, angle, y, rot });
    dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    dummy.rotation.copy(rot);
    dummy.updateMatrix();
    instancedKuiper.setMatrixAt(i, dummy.matrix);
  }
  instancedKuiper.instanceMatrix.needsUpdate = true;
  scene.add(instancedKuiper);

  const oortCount = 3000;
  const oortGeo = trackResource(new THREE.BufferGeometry());
  const oortPos = new Float32Array(oortCount * 3);
  for (let i = 0; i < oortCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 160 + Math.random() * 80;

    oortPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    oortPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    oortPos[i * 3 + 2] = r * Math.cos(phi);
  }
  oortGeo.setAttribute('position', new THREE.BufferAttribute(oortPos, 3));
  scene.add(new THREE.Points(oortGeo, trackResource(new THREE.PointsMaterial({
    size: 1.2,
    map: starTexture,
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }))));

  const kuiperMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(6.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
  kuiperMesh.position.set(0, 0, 65.0);
  kuiperMesh.userData = { key: 'kuiperbelt', data: kuiperData };
  scene.add(kuiperMesh);
  planetMeshes.kuiperbelt = kuiperMesh;
  interactiveObjects.push(kuiperMesh);

  return { instancedKuiper, kuiperCount, kuiperList };
}
