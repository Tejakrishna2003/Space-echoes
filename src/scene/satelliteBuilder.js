import * as THREE from 'three';

export function createISSModel(earthMesh, trackResource, SPACE_DATA, planetMeshes, interactiveObjects) {
  const issPivot = new THREE.Group();
  earthMesh.add(issPivot);

  const issGroup = new THREE.Group();

  const trussGeo = trackResource(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8));
  const trussMat = trackResource(new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 }));
  const trussMesh = new THREE.Mesh(trussGeo, trussMat);
  trussMesh.rotation.z = Math.PI / 2;
  issGroup.add(trussMesh);

  const panelGeo = trackResource(new THREE.BoxGeometry(0.12, 0.005, 0.06));
  const panelMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.1 }));
  const p1 = new THREE.Mesh(panelGeo, panelMat); p1.position.x = -0.15; issGroup.add(p1);
  const p2 = new THREE.Mesh(panelGeo, panelMat); p2.position.x = 0.15; issGroup.add(p2);

  const coreGeo = trackResource(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12));
  const coreMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.3 }));
  issGroup.add(new THREE.Mesh(coreGeo, coreMat));

  const earthSize = SPACE_DATA.earth ? SPACE_DATA.earth.size : 1.2;
  issGroup.position.x = earthSize * 1.35;
  issPivot.add(issGroup);
  earthMesh.userData.issPivot = issPivot;
  issGroup.userData = { key: 'iss', data: SPACE_DATA.iss, parentMesh: earthMesh };
  planetMeshes.iss = issGroup;
  interactiveObjects.push(issGroup);

  return issGroup;
}

export function createVoyager1Model(scene, trackResource, SPACE_DATA, planetMeshes, interactiveObjects) {
  const voyagerData = SPACE_DATA.voyager1;
  if (!voyagerData) return null;

  const vGroup = new THREE.Group();
  const dishGeo = trackResource(new THREE.ConeGeometry(0.35, 0.14, 32));
  const dishMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.4 }));
  const dishMesh = new THREE.Mesh(dishGeo, dishMat);
  dishMesh.rotation.x = Math.PI / 2;
  vGroup.add(dishMesh);

  const bodyGeo = trackResource(new THREE.BoxGeometry(0.2, 0.2, 0.2));
  const bodyMat = trackResource(new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 }));
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.z = -0.14;
  vGroup.add(bodyMesh);

  const pulseGeo = trackResource(new THREE.RingGeometry(0.4, 0.44, 32));
  const pulseMat = trackResource(new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
  const voyager1PulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
  vGroup.add(voyager1PulseMesh);

  vGroup.position.set(110.0, 15.0, -25.0);
  vGroup.userData = { key: 'voyager1', data: voyagerData };
  scene.add(vGroup);
  planetMeshes.voyager1 = vGroup;
  interactiveObjects.push(vGroup);

  return { vGroup, voyager1PulseMesh };
}

export function createCometSystem(scene, trackResource, starTexture) {
  const cometMesh = new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(0.35, 16, 16)),
    trackResource(new THREE.MeshBasicMaterial({ color: 0xe0f2fe }))
  );
  scene.add(cometMesh);

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
  scene.add(cometTailParticles);

  return { cometMesh, cometComaMesh, cometTailGeo, cometTailCount, cometHistory: [] };
}
