import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SPACE_DATA } from '../data/spaceData';
import {
  getSunTexture,
  getEarthTexture,
  getEarthSpecularMap,
  getEarthBumpMap,
  getEarthNightTexture,
  getEarthCloudTexture,
  getMarsTexture,
  getJupiterTexture,
  getSaturnTexture,
  getSaturnRingTexture,
  getMoonTexture,
  getVenusTexture,
  getIceGiantTexture
} from '../utils/planetTextureGenerator';

export default function ThreeCanvas({ selectedBodyKey, onPlanetClick, timeSpeed, setFps }) {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);

  // Smooth State Refs
  const selectedBodyKeyRef = useRef(selectedBodyKey);
  const timeSpeedRef = useRef(timeSpeed);

  useEffect(() => {
    selectedBodyKeyRef.current = selectedBodyKey;
  }, [selectedBodyKey]);

  useEffect(() => {
    timeSpeedRef.current = timeSpeed;
  }, [timeSpeed]);

  // Smooth Orbit & Zoom State
  const zoomDistanceRef = useRef(35);
  const zoomVelocityRef = useRef(0);
  const targetZoomDistanceRef = useRef(35);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const sphericalAngleRef = useRef({ theta: 0, phi: Math.PI / 4 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Track resources for GPU memory cleanup
    const disposableGeometries = [];
    const disposableMaterials = [];
    const disposableTextures = [];

    const trackResource = (obj) => {
      if (!obj) return obj;
      if (obj.isBufferGeometry || obj.isGeometry) disposableGeometries.push(obj);
      if (obj.isMaterial) disposableMaterials.push(obj);
      if (obj.isTexture) disposableTextures.push(obj);
      return obj;
    };

    // 1. Core WebGL Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 20, zoomDistanceRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Post-Processing Pipeline
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.8, 0.4, 0.85
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // 3. Lighting Setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));

    const sunLight = new THREE.PointLight(0xffaa00, 6.0, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const cameraFillLight = new THREE.DirectionalLight(0xffffff, 1.4);
    cameraFillLight.position.set(10, 20, 20);
    scene.add(cameraFillLight);

    // Data Structures
    const planetMeshes = {};
    const interactiveObjects = [];
    let earthCloudsMesh = null;
    let solarProminenceGroup = null;

    const getTextureForPlanet = (key) => {
      switch (key) {
        case 'sun': return getSunTexture();
        case 'mercury': return getMoonTexture();
        case 'venus': return getVenusTexture();
        case 'earth': return getEarthTexture();
        case 'moon': return getMoonTexture();
        case 'mars': return getMarsTexture();
        case 'jupiter': return getJupiterTexture();
        case 'saturn': return getSaturnTexture();
        case 'uranus': return getIceGiantTexture('#40c4de', '#1c7a8c');
        case 'neptune': return getIceGiantTexture('#1e429f', '#0a1d4a');
        default: return getEarthTexture();
      }
    };

    // 4. Ambient Skydome Starfield (20,000 stars)
    const skydomeCount = 20000;
    const skydomeGeo = trackResource(new THREE.BufferGeometry());
    const skydomePos = new Float32Array(skydomeCount * 3);
    const skydomeColors = new Float32Array(skydomeCount * 3);

    for (let i = 0; i < skydomeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 800 + Math.random() * 200;

      skydomePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      skydomePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      skydomePos[i * 3 + 2] = r * Math.cos(phi);

      const col = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.7, 0.7 + Math.random() * 0.3);
      skydomeColors[i * 3] = col.r;
      skydomeColors[i * 3 + 1] = col.g;
      skydomeColors[i * 3 + 2] = col.b;
    }

    skydomeGeo.setAttribute('position', new THREE.BufferAttribute(skydomePos, 3));
    skydomeGeo.setAttribute('color', new THREE.BufferAttribute(skydomeColors, 3));

    const skydomeMat = trackResource(new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    }));
    scene.add(new THREE.Points(skydomeGeo, skydomeMat));

    // 5. The Sun
    const sunData = SPACE_DATA.sun;
    const sunGeo = trackResource(new THREE.SphereGeometry(sunData.size, 64, 64));
    const sunMat = trackResource(new THREE.MeshBasicMaterial({ map: getSunTexture() }));
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { key: 'sun', data: sunData };
    scene.add(sunMesh);
    planetMeshes.sun = sunMesh;
    interactiveObjects.push(sunMesh);

    // Soft Volumetric Corona Plasma Glow (No Hard Outer Rings)
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
    sunMesh.add(new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(sunData.size * 1.3, 32, 32)),
      trackResource(new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }))
    ));

    // Prominence Flares
    solarProminenceGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const loopMesh = new THREE.Mesh(
        trackResource(new THREE.TorusGeometry(0.8 + Math.random() * 0.4, 0.08, 16, 64, Math.PI)),
        trackResource(new THREE.MeshBasicMaterial({ color: 0xff5500 }))
      );
      loopMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      solarProminenceGroup.add(loopMesh);
    }
    sunMesh.add(solarProminenceGroup);

    // 6. Planets & Multi-Moons with Axial Tilt
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
      const pData = SPACE_DATA[key];
      const pPivot = new THREE.Group();
      scene.add(pPivot);

      const pGeo = trackResource(new THREE.SphereGeometry(pData.size, 64, 64));
      const pTex = getTextureForPlanet(key);
      
      // Use MeshPhongMaterial for Earth (Specular Ocean Glint + Topographic Bump Map + Emissive Night Lights)
      const pMat = key === 'earth'
        ? trackResource(new THREE.MeshPhongMaterial({
            map: pTex,
            specularMap: getEarthSpecularMap(),
            specular: new THREE.Color(0x5599ff),
            shininess: 35,
            bumpMap: getEarthBumpMap(),
            bumpScale: 0.05,
            emissiveMap: getEarthNightTexture(),
            emissive: new THREE.Color(0xffaa22),
            emissiveIntensity: 0.5
          }))
        : trackResource(new THREE.MeshStandardMaterial({
            map: pTex,
            roughness: 0.4,
            metalness: 0.1
          }));

      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.x = pData.orbitRadius;
      pMesh.renderOrder = 1;
      
      // Apply Astronomical Axial Tilt
      if (pData.tilt) {
        pMesh.rotation.z = THREE.MathUtils.degToRad(pData.tilt);
      }

      pMesh.userData = { key: key, data: pData, pivot: pPivot };
      pPivot.add(pMesh);
      planetMeshes[key] = pMesh;
      interactiveObjects.push(pMesh);

      // Hyper-Real Earth: Clouds & Rayleigh Atmosphere
      if (key === 'earth') {
        // Cloud layer — NormalBlending with 0.22 opacity for natural weather wisps
        const cloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.025, 64, 64));
        const cloudMat = trackResource(new THREE.MeshStandardMaterial({
          map: getEarthCloudTexture(),
          transparent: true,
          opacity: 0.22,
          blending: THREE.NormalBlending,
          depthWrite: false
        }));
        earthCloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        earthCloudsMesh.renderOrder = 2;
        pMesh.add(earthCloudsMesh);

        // Fresnel Atmospheric Limb Glow Shader (1.05 size, 3.8 exponent for thin, elegant horizon glow)
        const rayleighMat = trackResource(new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0x0077ff) }
          },
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
              gl_FragColor = vec4(color, rim * 0.45);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide
        }));
        const rayleighMesh = new THREE.Mesh(
          trackResource(new THREE.SphereGeometry(pData.size * 1.05, 48, 48)),
          rayleighMat
        );
        rayleighMesh.renderOrder = 3;
        pMesh.add(rayleighMesh);
      }

      // Atmospheric Glow Shells
      if (key === 'venus' || key === 'mars' || key === 'neptune') {
        pMesh.add(new THREE.Mesh(
          trackResource(new THREE.SphereGeometry(pData.size * 1.06, 32, 32)),
          trackResource(new THREE.MeshBasicMaterial({
            color: key === 'venus' ? 0xffcc33 : (key === 'mars' ? 0xff4400 : 0x1e429f),
            transparent: true, opacity: 0.25, side: THREE.BackSide
          }))
        ));
      }

      // Orbital Path Ring
      const pathGeo = trackResource(new THREE.RingGeometry(pData.orbitRadius - 0.05, pData.orbitRadius + 0.05, 128));
      const pathMat = trackResource(new THREE.MeshBasicMaterial({ color: pData.colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }));
      const pathMesh = new THREE.Mesh(pathGeo, pathMat);
      pathMesh.rotation.x = Math.PI / 2;
      scene.add(pathMesh);

      // Earth Moon (Luna)
      if (pData.hasMoon) {
        const moonPivot = new THREE.Group();
        pMesh.add(moonPivot);
        const moonMesh = new THREE.Mesh(
          trackResource(new THREE.SphereGeometry(SPACE_DATA.moon.size, 32, 32)),
          trackResource(new THREE.MeshStandardMaterial({ map: getMoonTexture(), roughness: 0.6 }))
        );
        moonMesh.position.x = pData.moonRadius;
        moonMesh.userData = { key: 'moon', data: SPACE_DATA.moon, parentMesh: pMesh };
        moonPivot.add(moonMesh);
        pMesh.userData.moonPivot = moonPivot;
        planetMeshes.moon = moonMesh;
        interactiveObjects.push(moonMesh);

        const moonPathMesh = new THREE.Mesh(
          trackResource(new THREE.RingGeometry(pData.moonRadius - 0.03, pData.moonRadius + 0.03, 64)),
          trackResource(new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide, transparent: true, opacity: 0.2 }))
        );
        moonPathMesh.rotation.x = Math.PI / 2;
        pMesh.add(moonPathMesh);
      }

      // Extra Moons (Mars, Jupiter, Neptune)
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
        });
      }

      // Saturn Rings
      if (pData.hasRings) {
        const ringMesh = new THREE.Mesh(
          trackResource(new THREE.RingGeometry(pData.ringInner, pData.ringOuter, 64)),
          trackResource(new THREE.MeshStandardMaterial({
            map: getSaturnRingTexture(),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            roughness: 0.3
          }))
        );
        ringMesh.rotation.x = Math.PI / 2.3;
        pMesh.add(ringMesh);
      }
    });

    // 7. InstancedMesh Asteroid Belt (1 draw call instead of 1,500)
    const astCount = 1500;
    const astGeo = trackResource(new THREE.DodecahedronGeometry(0.08, 0));
    const astMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.7 }));
    const instancedAsteroids = new THREE.InstancedMesh(astGeo, astMat, astCount);

    const dummy = new THREE.Object3D();
    const asteroidData = [];

    for (let i = 0; i < astCount; i++) {
      const radius = 16.0 + Math.random() * 2.5;
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

    // 8. NASA Barred Spiral Galaxy
    const starCount = 35000;
    const starGeo = trackResource(new THREE.BufferGeometry());
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const galaxyGroup = new THREE.Group();
    galaxyGroup.position.set(0, -30, -50);
    scene.add(galaxyGroup);

    galaxyGroup.add(new THREE.PointLight(0xffea9f, 6.0, 60));
    galaxyGroup.add(new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(3.5, 32, 32)),
      trackResource(new THREE.MeshBasicMaterial({ color: 0xfff4cc, transparent: true, opacity: 0.95 }))
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
        mixedColor.setHSL(0.55 + Math.random() * 0.1, 0.85, 0.75 + Math.random() * 0.2);
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
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    }))));

    // 9. Interaction, Controls & Touch Support
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let initialPinchDistance = 0;

    const handlePointerDown = (e) => {
      if (e.target.tagName === 'CANVAS') {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        sphericalAngleRef.current.theta -= deltaX * 0.005;
        sphericalAngleRef.current.phi = THREE.MathUtils.clamp(
          sphericalAngleRef.current.phi - deltaY * 0.005,
          0.1,
          Math.PI - 0.1
        );

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Hover Tooltip Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const data = hitObj.userData && hitObj.userData.data;
        if (data && tooltipRef.current) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${e.clientX + 15}px`;
          tooltipRef.current.style.top = `${e.clientY + 15}px`;
          tooltipRef.current.innerText = `${data.name} // ${data.distance}`;
        }
        document.body.style.cursor = 'pointer';
      } else {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        document.body.style.cursor = 'crosshair';
      }
    };

    const handlePointerUp = () => { isDragging = false; };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        sphericalAngleRef.current.theta -= deltaX * 0.005;
        sphericalAngleRef.current.phi = THREE.MathUtils.clamp(
          sphericalAngleRef.current.phi - deltaY * 0.005,
          0.1,
          Math.PI - 0.1
        );
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = initialPinchDistance - dist;
        zoomVelocityRef.current += delta * 0.02;
        initialPinchDistance = dist;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const normalizedDelta = Math.max(-1, Math.min(1, e.deltaY));
      zoomVelocityRef.current += normalizedDelta * 0.4;
    };

    const handleClick = (e) => {
      if (e.target.tagName !== 'CANVAS') return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.key && onPlanetClick) {
          onPlanetClick(hit.userData.key);
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('click', handleClick);

    // 10. Delta Time Render Loop
    let frameCount = 0;
    let lastTime = performance.now();
    let prevFrameTime = performance.now();
    let animId;
    let prevSelectedKey = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const deltaTime = Math.min((now - prevFrameTime) * 0.001, 0.1);
      prevFrameTime = now;

      const time = now * 0.001;
      const currentSpeed = timeSpeedRef.current || 1;

      // FPS Calculation
      frameCount++;
      if (now - lastTime >= 1000) {
        if (setFps) setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Rotate Sun Core & Prominences
      sunMesh.rotation.y += 0.05 * deltaTime;
      if (solarProminenceGroup) {
        solarProminenceGroup.rotation.z += 0.1 * deltaTime;
        solarProminenceGroup.rotation.x += 0.05 * deltaTime;
      }

      // Rotate Earth Clouds
      if (earthCloudsMesh) {
        earthCloudsMesh.rotation.y += 0.08 * deltaTime;
      }

      // Rotate Instanced Asteroids
      for (let i = 0; i < astCount; i++) {
        const item = asteroidData[i];
        item.angle += 0.02 * currentSpeed * deltaTime;
        dummy.position.set(Math.cos(item.angle) * item.radius, item.y, Math.sin(item.angle) * item.radius);
        dummy.rotation.copy(item.rot);
        dummy.updateMatrix();
        instancedAsteroids.setMatrixAt(i, dummy.matrix);
      }
      instancedAsteroids.instanceMatrix.needsUpdate = true;

      // Rotate Galaxy
      galaxyGroup.rotation.y += 0.008 * deltaTime;

      // Orbit Planets & Extra Moons
      planetKeys.forEach(key => {
        const pData = SPACE_DATA[key];
        const pMesh = planetMeshes[key];
        if (pMesh && pMesh.userData.pivot) {
          pMesh.userData.pivot.rotation.y += pData.orbitSpeed * 0.5 * currentSpeed * deltaTime;
          pMesh.rotation.y += 0.3 * deltaTime;

          if (pMesh.userData.moonPivot) {
            pMesh.userData.moonPivot.rotation.y += pData.moonSpeed * 1.5 * currentSpeed * deltaTime;
          }

          if (pMesh.userData.extraMoonPivots) {
            pMesh.userData.extraMoonPivots.forEach(item => {
              item.pivot.rotation.y += item.speed * 2.0 * currentSpeed * deltaTime;
            });
          }
        }
      });

      // Target Focus & Auto-Zoom Calculation
      const targetPos = new THREE.Vector3(0, 0, 0);
      const currentSelectedKey = selectedBodyKeyRef.current;

      if (currentSelectedKey !== prevSelectedKey) {
        prevSelectedKey = currentSelectedKey;
        const targetData = SPACE_DATA[currentSelectedKey];
        if (targetData) {
          targetZoomDistanceRef.current = targetData.size ? Math.max(3.5, targetData.size * 6.0) : 35;
        }
      }

      if (currentSelectedKey && currentSelectedKey !== 'galaxy') {
        const targetMesh = planetMeshes[currentSelectedKey];
        if (targetMesh) {
          targetMesh.getWorldPosition(targetPos);
          cameraFillLight.position.set(targetPos.x + 10, targetPos.y + 15, targetPos.z + 20);
        }
      } else if (currentSelectedKey === 'galaxy') {
        targetPos.set(0, -30, -50);
      }

      // If user is manually scrolling/zooming, update target zoom to match user's input
      if (Math.abs(zoomVelocityRef.current) > 0.001) {
        targetZoomDistanceRef.current = zoomDistanceRef.current + zoomVelocityRef.current;
      }

      // Smooth Zoom Lerp towards target distance
      zoomDistanceRef.current += (targetZoomDistanceRef.current - zoomDistanceRef.current) * 0.1;

      // Apply Zoom Momentum and Clamp Bounds
      zoomDistanceRef.current = THREE.MathUtils.clamp(
        zoomDistanceRef.current + zoomVelocityRef.current,
        2.0,
        150.0
      );
      zoomVelocityRef.current *= 0.88;

      // Camera Target Lerp
      cameraTargetRef.current.lerp(targetPos, 0.08);

      // Spherical Camera Position Calculation
      const dist = zoomDistanceRef.current;
      const theta = sphericalAngleRef.current.theta;
      const phi = sphericalAngleRef.current.phi;

      camera.position.set(
        cameraTargetRef.current.x + dist * Math.sin(phi) * Math.sin(theta),
        cameraTargetRef.current.y + dist * Math.cos(phi),
        cameraTargetRef.current.z + dist * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(cameraTargetRef.current);

      composer.render();
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);

      // Full GPU Resource Disposal
      disposableGeometries.forEach(g => g.dispose());
      disposableMaterials.forEach(m => m.dispose());
      disposableTextures.forEach(t => t.dispose());
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className="fixed inset-0 z-0" />
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-white/20 text-emerald-300 font-label-sm text-[10px] tracking-widest uppercase shadow-lg hidden"
      />
    </>
  );
}
