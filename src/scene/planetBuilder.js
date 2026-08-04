import * as THREE from 'three';
import { createPlanetCutawayGroup } from './cutawayBuilder';

export function createSunMesh(scene, trackResource, SPACE_DATA, textureGenerators, planetMeshes, interactiveObjects) {
  const { getSunTexture } = textureGenerators;
  const sunData = SPACE_DATA.sun;
  const sunGeo = trackResource(new THREE.SphereGeometry(sunData.size, 64, 64));
  const sunMat = trackResource(new THREE.MeshBasicMaterial({ map: getSunTexture() }));
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.userData = { key: 'sun', data: sunData };
  scene.add(sunMesh);
  planetMeshes.sun = sunMesh;
  interactiveObjects.push(sunMesh);

  const sunCutawayGroup = createPlanetCutawayGroup('sun', sunData.size, getSunTexture(), trackResource);
  sunMesh.add(sunCutawayGroup);
  sunMesh.userData.cutawayGroup = sunCutawayGroup;

  sunMesh.add(new THREE.Mesh(
    trackResource(new THREE.SphereGeometry(sunData.size * 1.15, 32, 32)),
    trackResource(new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))
  ));

  const solarProminenceGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const loopMesh = new THREE.Mesh(
      trackResource(new THREE.TorusGeometry(sunData.size * (0.35 + Math.random() * 0.25), 0.08, 16, 64, Math.PI)),
      trackResource(new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff3300 : 0xffaa00,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }))
    );
    loopMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    solarProminenceGroup.add(loopMesh);
  }
  sunMesh.add(solarProminenceGroup);

  return { sunMesh, solarProminenceGroup };
}

export function createPlanetsAndMoons(scene, trackResource, SPACE_DATA, textureGenerators, planetMeshes, interactiveObjects) {
  const {
    getSunTexture, getMercuryTexture, getMercuryBumpMap, getMercurySpecularMap,
    getVenusTexture, getEarthTexture, getEarthSpecularMap, getEarthBumpMap,
    getEarthNightTexture, getEarthCloudTexture, getMoonTexture, getMoonBumpMap,
    getMoonSpecularMap, getMarsTexture, getMarsBumpMap, getMarsDustStormTexture,
    getJupiterTexture, getJupiterCloudTexture, getSaturnTexture, getSaturnCloudTexture,
    getSaturnRingTexture, getIceGiantTexture, getUranusCloudTexture, getNeptuneCloudTexture,
    getPlutoTexture
  } = textureGenerators;

  const dynamicMeshes = {};
  const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  planetKeys.forEach(key => {
    const pData = SPACE_DATA[key];
    const pPivot = new THREE.Group();
    scene.add(pPivot);

    const pGeo = trackResource(new THREE.SphereGeometry(pData.size, 64, 64));
    let pTex;
    switch (key) {
      case 'sun': pTex = getSunTexture(); break;
      case 'mercury': pTex = getMercuryTexture(); break;
      case 'venus': pTex = getVenusTexture(); break;
      case 'earth': pTex = getEarthTexture(); break;
      case 'moon': pTex = getMoonTexture(); break;
      case 'mars': pTex = getMarsTexture(); break;
      case 'jupiter': pTex = getJupiterTexture(); break;
      case 'saturn': pTex = getSaturnTexture(); break;
      case 'uranus': pTex = getIceGiantTexture('#40c4de', '#1c7a8c'); break;
      case 'neptune': pTex = getIceGiantTexture('#1e429f', '#0a1d4a'); break;
      case 'pluto': pTex = getPlutoTexture(); break;
      default: pTex = getEarthTexture(); break;
    }

    let pMat;
    if (key === 'earth') {
      pMat = trackResource(new THREE.MeshPhongMaterial({
        map: pTex,
        specularMap: getEarthSpecularMap(),
        specular: new THREE.Color(0x5599ff),
        shininess: 35,
        bumpMap: getEarthBumpMap(),
        bumpScale: 0.05,
        emissiveMap: getEarthNightTexture(),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.7
      }));
    } else if (key === 'mercury') {
      pMat = trackResource(new THREE.MeshPhongMaterial({
        map: pTex,
        bumpMap: getMercuryBumpMap(),
        bumpScale: 0.04,
        specularMap: getMercurySpecularMap(),
        specular: new THREE.Color(0x444444),
        shininess: 15
      }));
    } else if (key === 'mars') {
      pMat = trackResource(new THREE.MeshPhongMaterial({
        map: pTex,
        bumpMap: getMarsBumpMap(),
        bumpScale: 0.05,
        specular: new THREE.Color(0x221100),
        shininess: 8
      }));
    } else if (key === 'jupiter') {
      pMat = trackResource(new THREE.MeshPhongMaterial({ map: pTex, specular: new THREE.Color(0x332211), shininess: 12 }));
    } else if (key === 'saturn') {
      pMat = trackResource(new THREE.MeshPhongMaterial({ map: pTex, specular: new THREE.Color(0x443311), shininess: 15 }));
    } else if (key === 'uranus') {
      pMat = trackResource(new THREE.MeshPhongMaterial({ map: pTex, specular: new THREE.Color(0x225566), shininess: 25 }));
    } else if (key === 'neptune') {
      pMat = trackResource(new THREE.MeshPhongMaterial({ map: pTex, specular: new THREE.Color(0x113366), shininess: 30 }));
    } else {
      pMat = trackResource(new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.4, metalness: 0.1 }));
    }

    if (pData.orbitRadius > 0) {
      const orbitPathGeo = trackResource(new THREE.RingGeometry(pData.orbitRadius - 0.03, pData.orbitRadius + 0.03, 128));
      const orbitPathMat = trackResource(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
        depthWrite: false
      }));
      const orbitPathMesh = new THREE.Mesh(orbitPathGeo, orbitPathMat);
      orbitPathMesh.rotation.x = Math.PI / 2;
      scene.add(orbitPathMesh);
    }

    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.x = pData.orbitRadius;
    pMesh.renderOrder = 1;

    if (pData.tilt) {
      pMesh.rotation.z = THREE.MathUtils.degToRad(pData.tilt);
    }

    const pCutawayGroup = createPlanetCutawayGroup(key, pData.size, pTex, trackResource);
    pMesh.add(pCutawayGroup);
    pMesh.userData = { key: key, data: pData, pivot: pPivot, cutawayGroup: pCutawayGroup };
    pPivot.add(pMesh);
    planetMeshes[key] = pMesh;
    interactiveObjects.push(pMesh);

    const createLimbShader = (colorHex, opacityVal, scaleFactor = 1.05) => {
      return new THREE.Mesh(
        trackResource(new THREE.SphereGeometry(pData.size * scaleFactor, 32, 32)),
        trackResource(new THREE.ShaderMaterial({
          uniforms: { color: { value: new THREE.Color(colorHex) } },
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
              float rim = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.8);
              rim = clamp(rim, 0.0, 1.0);
              gl_FragColor = vec4(color, rim * ${opacityVal});
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide
        }))
      );
    };

    if (key === 'mercury') {
      pMesh.add(createLimbShader(0xa0a0a0, 0.12, 1.03));
    }

    if (key === 'venus') {
      const vCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.03, 64, 64));
      const vCloudMat = trackResource(new THREE.MeshStandardMaterial({
        map: getVenusTexture(),
        transparent: true,
        opacity: 0.75,
        color: new THREE.Color(0xf5edc0),
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.venusCloudsMesh = new THREE.Mesh(vCloudGeo, vCloudMat);
      dynamicMeshes.venusCloudsMesh.renderOrder = 2;
      pMesh.add(dynamicMeshes.venusCloudsMesh);

      dynamicMeshes.venusLightningLight = trackResource(new THREE.PointLight(0xffff55, 0, 15));
      dynamicMeshes.venusLightningLight.position.set(0, pData.size * 0.8, pData.size * 0.8);
      pMesh.add(dynamicMeshes.venusLightningLight);

      pMesh.add(createLimbShader(0xffcc44, 0.35, 1.05));
    }

    if (key === 'mars') {
      const marsAtmMesh = createLimbShader(0xff4400, 0.28, 1.05);
      marsAtmMesh.renderOrder = 3;
      pMesh.add(marsAtmMesh);

      const mDustGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.025, 48, 48));
      const mDustMat = trackResource(new THREE.MeshStandardMaterial({
        map: getMarsDustStormTexture(),
        transparent: true,
        opacity: 0.40,
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.marsDustMesh = new THREE.Mesh(mDustGeo, mDustMat);
      pMesh.add(dynamicMeshes.marsDustMesh);
    }

    if (key === 'earth') {
      const cloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.025, 64, 64));
      const cloudMat = trackResource(new THREE.MeshStandardMaterial({
        map: getEarthCloudTexture(),
        transparent: true,
        opacity: 0.22,
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.earthCloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      dynamicMeshes.earthCloudsMesh.renderOrder = 2;
      pMesh.add(dynamicMeshes.earthCloudsMesh);

      dynamicMeshes.earthRayleighMesh = createLimbShader(0x0077ff, 0.45, 1.05);
      dynamicMeshes.earthRayleighMesh.renderOrder = 3;
      pMesh.add(dynamicMeshes.earthRayleighMesh);
    }

    if (key === 'jupiter') {
      const jCloudGeo1 = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
      const jCloudMat1 = trackResource(new THREE.MeshStandardMaterial({
        map: getJupiterCloudTexture(),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      dynamicMeshes.jupiterCloudsEastMesh = new THREE.Mesh(jCloudGeo1, jCloudMat1);
      pMesh.add(dynamicMeshes.jupiterCloudsEastMesh);

      const jCloudGeo2 = trackResource(new THREE.SphereGeometry(pData.size * 1.020, 64, 64));
      const jCloudMat2 = trackResource(new THREE.MeshStandardMaterial({
        map: getJupiterCloudTexture(),
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.jupiterCloudsWestMesh = new THREE.Mesh(jCloudGeo2, jCloudMat2);
      pMesh.add(dynamicMeshes.jupiterCloudsWestMesh);

      pMesh.add(createLimbShader(0xffaa44, 0.30, 1.04));
    }

    if (key === 'saturn') {
      const sCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
      const sCloudMat = trackResource(new THREE.MeshStandardMaterial({
        map: getSaturnCloudTexture(),
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      dynamicMeshes.saturnCloudsMesh = new THREE.Mesh(sCloudGeo, sCloudMat);
      pMesh.add(dynamicMeshes.saturnCloudsMesh);
      pMesh.add(createLimbShader(0xeab308, 0.25, 1.04));
    }

    if (key === 'uranus') {
      const uCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
      const uCloudMat = trackResource(new THREE.MeshStandardMaterial({
        map: getUranusCloudTexture(),
        transparent: true,
        opacity: 0.40,
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.uranusCloudsMesh = new THREE.Mesh(uCloudGeo, uCloudMat);
      pMesh.add(dynamicMeshes.uranusCloudsMesh);
      pMesh.add(createLimbShader(0x06b6d4, 0.35, 1.04));
    }

    if (key === 'neptune') {
      const nCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
      const nCloudMat = trackResource(new THREE.MeshStandardMaterial({
        map: getNeptuneCloudTexture(),
        transparent: true,
        opacity: 0.45,
        blending: THREE.NormalBlending,
        depthWrite: false
      }));
      dynamicMeshes.neptuneCloudsMesh = new THREE.Mesh(nCloudGeo, nCloudMat);
      pMesh.add(dynamicMeshes.neptuneCloudsMesh);

      const nCirrusGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.022, 64, 64));
      const nCirrusMat = trackResource(new THREE.MeshStandardMaterial({
        map: getNeptuneCloudTexture(),
        transparent: true,
        opacity: 0.50,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      dynamicMeshes.neptuneCirrusMesh = new THREE.Mesh(nCirrusGeo, nCirrusMat);
      pMesh.add(dynamicMeshes.neptuneCirrusMesh);

      pMesh.add(createLimbShader(0x2563eb, 0.40, 1.04));
    }

    if (pData.hasMoon) {
      const moonPivot = new THREE.Group();
      pMesh.add(moonPivot);

      const moonMesh = new THREE.Mesh(
        trackResource(new THREE.SphereGeometry(SPACE_DATA.moon.size, 32, 32)),
        trackResource(new THREE.MeshPhongMaterial({
          map: getMoonTexture(),
          bumpMap: getMoonBumpMap(),
          bumpScale: 0.04,
          specularMap: getMoonSpecularMap(),
          specular: new THREE.Color(0x333333),
          shininess: 10
        }))
      );
      const moonCutawayGroup = createPlanetCutawayGroup('moon', SPACE_DATA.moon.size, getMoonTexture(), trackResource);
      moonMesh.add(moonCutawayGroup);
      moonMesh.position.x = pData.moonRadius;
      moonMesh.userData = { key: 'moon', data: SPACE_DATA.moon, parentMesh: pMesh, cutawayGroup: moonCutawayGroup };
      moonPivot.add(moonMesh);
      pMesh.userData.moonPivot = moonPivot;
      planetMeshes.moon = moonMesh;
      interactiveObjects.push(moonMesh);

      const moonPathMesh = new THREE.Mesh(
        trackResource(new THREE.RingGeometry(pData.moonRadius - 0.02, pData.moonRadius + 0.02, 64)),
        trackResource(new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide, transparent: true, opacity: 0.25 }))
      );
      moonPathMesh.rotation.x = Math.PI / 2;
      pMesh.add(moonPathMesh);
    }

    if (pData.extraMoons) {
      pMesh.userData.extraMoonPivots = [];
      pData.extraMoons.forEach(m => {
        const mPivot = new THREE.Group();
        pMesh.add(mPivot);
        const mMesh = new THREE.Mesh(
          trackResource(new THREE.SphereGeometry(m.size, 16, 16)),
          trackResource(new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.6 }))
        );
        mMesh.position.x = m.radius;
        mPivot.add(mMesh);
        pMesh.userData.extraMoonPivots.push({ pivot: mPivot, speed: m.speed });

        const mPath = new THREE.Mesh(
          trackResource(new THREE.RingGeometry(m.radius - 0.015, m.radius + 0.015, 48)),
          trackResource(new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide, transparent: true, opacity: 0.18 }))
        );
        mPath.rotation.x = Math.PI / 2;
        pMesh.add(mPath);
      });
    }

    if (['venus', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(key)) {
      const rimColor = key === 'venus' ? 0xffdd66
                     : key === 'jupiter' ? 0xffaa55
                     : key === 'saturn' ? 0xffe099
                     : key === 'uranus' ? 0x60efff
                     : 0x4488ff;
      const rimGlowMesh = new THREE.Mesh(
        trackResource(new THREE.SphereGeometry(pData.size * 1.04, 32, 32)),
        trackResource(new THREE.MeshBasicMaterial({
          color: rimColor,
          transparent: true,
          opacity: key === 'venus' ? 0.28 : 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide
        }))
      );
      pMesh.add(rimGlowMesh);
    }

    if (pData.hasRings) {
      const ringMesh = new THREE.Mesh(
        trackResource(new THREE.RingGeometry(pData.ringInner, pData.ringOuter, 64)),
        trackResource(new THREE.MeshStandardMaterial({
          map: key === 'saturn' ? getSaturnRingTexture() : null,
          color: key === 'uranus' ? 0x40c4de : 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: key === 'uranus' ? 0.4 : 0.9,
          roughness: 0.3
        }))
      );
      ringMesh.rotation.x = Math.PI / 2;
      pMesh.add(ringMesh);
    }
  });

  const astCount = 1500;
  const astGeo = trackResource(new THREE.DodecahedronGeometry(0.08, 0));
  const astMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.7 }));
  const instancedAsteroids = new THREE.InstancedMesh(astGeo, astMat, astCount);

  const dummy = new THREE.Object3D();
  const asteroidData = [];

  for (let i = 0; i < astCount; i++) {
    const radius = 18.5 + Math.random() * 3.0;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 0.8;
    const rot = new THREE.Euler(Math.random(), Math.random(), Math.random());

    asteroidData.push({ radius, angle, y, rot });

    dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    dummy.rotation.copy(rot);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);
  }
  instancedAsteroids.instanceMatrix.needsUpdate = true;
  scene.add(instancedAsteroids);

  // Pluto & Charon
  const plutoData = SPACE_DATA.pluto;
  if (plutoData) {
    const plutoPivot = new THREE.Group();
    scene.add(plutoPivot);

    const plutoMesh = new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(plutoData.size, 32, 32)),
      trackResource(new THREE.MeshStandardMaterial({
        map: getPlutoTexture(),
        roughness: 0.6,
        metalness: 0.1
      }))
    );
    plutoMesh.position.x = plutoData.orbitRadius;
    plutoMesh.rotation.z = THREE.MathUtils.degToRad(plutoData.tilt);
    const plutoCutawayGroup = createPlanetCutawayGroup('pluto', plutoData.size, getPlutoTexture(), trackResource);
    plutoMesh.add(plutoCutawayGroup);
    plutoMesh.userData = { key: 'pluto', data: plutoData, pivot: plutoPivot, cutawayGroup: plutoCutawayGroup };
    plutoPivot.add(plutoMesh);
    planetMeshes.pluto = plutoMesh;
    interactiveObjects.push(plutoMesh);

    const charonPivot = new THREE.Group();
    plutoMesh.add(charonPivot);
    const charonMesh = new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(0.09, 16, 16)),
      trackResource(new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 }))
    );
    charonMesh.position.x = 0.7;
    charonPivot.add(charonMesh);
    plutoMesh.userData.extraMoonPivots = [{ pivot: charonPivot, speed: 0.04 }];

    const plutoOrbitPathMesh = new THREE.Mesh(
      trackResource(new THREE.RingGeometry(plutoData.orbitRadius - 0.04, plutoData.orbitRadius + 0.04, 128)),
      trackResource(new THREE.MeshBasicMaterial({ color: 0xc29b7f, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false }))
    );
    plutoOrbitPathMesh.rotation.x = Math.PI / 2;
    scene.add(plutoOrbitPathMesh);
  }

  return { dynamicMeshes, instancedAsteroids, astCount, asteroidData, dummy };
}
