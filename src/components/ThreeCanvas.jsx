import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { SPACE_DATA } from '../data/spaceData';
import {
  getSunTexture, getMercuryTexture, getMercuryBumpMap, getMercurySpecularMap,
  getVenusTexture, getEarthTexture, getEarthSpecularMap, getEarthBumpMap,
  getEarthNightTexture, getEarthCloudTexture, getMoonTexture, getMoonBumpMap,
  getMoonSpecularMap, getMarsTexture, getMarsBumpMap, getMarsDustStormTexture,
  getJupiterTexture, getJupiterCloudTexture, getSaturnTexture, getSaturnCloudTexture,
  getSaturnRingTexture, getIceGiantTexture, getUranusCloudTexture, getNeptuneCloudTexture,
  getPlutoTexture, getBlackHoleAccretionTexture
} from '../utils/planetTextureGenerator';

import { createStarTexture, createStarfieldTiers, createConstellationsGroup } from '../scene/starfieldBuilder';
import { createSunMesh, createPlanetsAndMoons } from '../scene/planetBuilder';
import { createMilkyWayGalaxy, createOrionNebula, createAndromedaGalaxy, createSupermassiveBlackHole, createKuiperBeltAndOortCloud } from '../scene/deepSpaceBuilder';
import { createISSModel, createVoyager1Model, createCometSystem } from '../scene/satelliteBuilder';

export default function ThreeCanvas({
  selectedBodyKey,
  onPlanetClick,
  timeSpeed = 1,
  setFps,
  isCutawayOpen = false,
  hasStarted = false,
  setRenderStats,
  isConstellationsOpen = false
}) {
  const mountRef = useRef(null);

  const selectedBodyKeyRef = useRef(selectedBodyKey);
  const timeSpeedRef = useRef(timeSpeed);
  const isCutawayOpenRef = useRef(isCutawayOpen);
  const isConstellationsOpenRef = useRef(isConstellationsOpen);

  useEffect(() => { selectedBodyKeyRef.current = selectedBodyKey; }, [selectedBodyKey]);
  useEffect(() => { timeSpeedRef.current = timeSpeed; }, [timeSpeed]);
  useEffect(() => { isCutawayOpenRef.current = isCutawayOpen; }, [isCutawayOpen]);
  useEffect(() => { isConstellationsOpenRef.current = isConstellationsOpen; }, [isConstellationsOpen]);

  const sphericalAngleRef = useRef({ theta: 0.3, phi: Math.PI / 2.4 });
  const zoomDistanceRef = useRef(35.0);
  const targetZoomDistanceRef = useRef(35.0);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const zoomVelocityRef = useRef(0);

  useEffect(() => {
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020208, 0.0004);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);
    camera.position.set(0, 15, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.75, 0.45, 0.85);
    composer.addPass(bloomPass);

    const sceneResources = [];
    const trackResource = (res) => {
      if (res) sceneResources.push(res);
      return res;
    };

    // Lights
    scene.add(new THREE.AmbientLight(0xdbeafe, 0.8));
    const sunPointLight = new THREE.PointLight(0xfffae6, 3.5, 350, 0.4);
    scene.add(sunPointLight);
    const cameraFillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    scene.add(cameraFillLight);

    const planetMeshes = {};
    const interactiveObjects = [];

    const textureGenerators = {
      getSunTexture, getMercuryTexture, getMercuryBumpMap, getMercurySpecularMap,
      getVenusTexture, getEarthTexture, getEarthSpecularMap, getEarthBumpMap,
      getEarthNightTexture, getEarthCloudTexture, getMoonTexture, getMoonBumpMap,
      getMoonSpecularMap, getMarsTexture, getMarsBumpMap, getMarsDustStormTexture,
      getJupiterTexture, getJupiterCloudTexture, getSaturnTexture, getSaturnCloudTexture,
      getSaturnRingTexture, getIceGiantTexture, getUranusCloudTexture, getNeptuneCloudTexture,
      getPlutoTexture
    };

    // 1. Starfield & Constellations
    const starTexture = createStarTexture();
    createStarfieldTiers(scene, trackResource, starTexture);
    const constellationsGroup = createConstellationsGroup(scene, trackResource);

    // 2. Sun & Planets
    const { sunMesh, solarProminenceGroup } = createSunMesh(scene, trackResource, SPACE_DATA, textureGenerators, planetMeshes, interactiveObjects);
    const { dynamicMeshes, instancedAsteroids, astCount, asteroidData, dummy } = createPlanetsAndMoons(scene, trackResource, SPACE_DATA, textureGenerators, planetMeshes, interactiveObjects);

    // 3. Satellites
    if (planetMeshes.earth) {
      createISSModel(planetMeshes.earth, trackResource, SPACE_DATA, planetMeshes, interactiveObjects);
    }
    const voyagerRes = createVoyager1Model(scene, trackResource, SPACE_DATA, planetMeshes, interactiveObjects);
    const voyager1PulseMesh = voyagerRes ? voyagerRes.voyager1PulseMesh : null;
    const { cometMesh, cometComaMesh, cometTailGeo, cometTailCount, cometHistory } = createCometSystem(scene, trackResource, starTexture);

    // 4. Deep Space Realms
    const { sagittariusACoreMesh, galaxyGroup } = createMilkyWayGalaxy(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects);
    const { nebulaGroup, trapeziumStarsGroup } = createOrionNebula(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects);
    const androGroup = createAndromedaGalaxy(scene, trackResource, starTexture, SPACE_DATA, planetMeshes, interactiveObjects);
    const { bhGroup, blackHoleAccretionRing } = createSupermassiveBlackHole(scene, trackResource, SPACE_DATA, getBlackHoleAccretionTexture, planetMeshes, interactiveObjects);
    const { instancedKuiper, kuiperCount, kuiperList } = createKuiperBeltAndOortCloud(scene, trackResource, starTexture, SPACE_DATA, dummy, planetMeshes, interactiveObjects);

    // Interaction Listeners
    let isPointerDown = false;
    let pointerDownPosition = { x: 0, y: 0 };
    let previousPointerPosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      isPointerDown = true;
      pointerDownPosition = { x: e.clientX, y: e.clientY };
      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (!isPointerDown) return;
      const deltaX = e.clientX - previousPointerPosition.x;
      const deltaY = e.clientY - previousPointerPosition.y;

      sphericalAngleRef.current.theta -= deltaX * 0.005;
      sphericalAngleRef.current.phi -= deltaY * 0.005;
      sphericalAngleRef.current.phi = THREE.MathUtils.clamp(sphericalAngleRef.current.phi, 0.05, Math.PI - 0.05);

      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => { isPointerDown = false; };

    let initialPinchDistance = null;
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && initialPinchDistance) {
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
      const moveDistance = Math.hypot(e.clientX - pointerDownPosition.x, e.clientY - pointerDownPosition.y);
      if (moveDistance > 6) return;

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

    // Delta Time Render Loop
    let frameCount = 0;
    let lastTime = performance.now();
    let prevFrameTime = performance.now();
    let animId;
    let prevSelectedKey = null;
    const targetPosVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const deltaTime = Math.min((now - prevFrameTime) * 0.001, 0.1);
      prevFrameTime = now;

      const time = now * 0.001;
      const currentSpeed = timeSpeedRef.current || 1;

      frameCount++;
      if (now - lastTime >= 1000) {
        if (setFps) setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Rotate Sun Core & Prominences
      sunMesh.rotation.y += 0.05 * deltaTime;
      sunMesh.scale.setScalar(1.0 + Math.sin(time * 1.5) * 0.012);
      if (solarProminenceGroup) {
        solarProminenceGroup.rotation.z += 0.1 * deltaTime;
        solarProminenceGroup.rotation.x += 0.05 * deltaTime;
      }

      // Rotate Clouds & Atmospheres
      if (dynamicMeshes.earthCloudsMesh) dynamicMeshes.earthCloudsMesh.rotation.y += 0.08 * deltaTime;
      if (dynamicMeshes.venusCloudsMesh) dynamicMeshes.venusCloudsMesh.rotation.y += 0.015 * deltaTime;
      if (dynamicMeshes.jupiterCloudsEastMesh) dynamicMeshes.jupiterCloudsEastMesh.rotation.y += 0.05 * deltaTime;
      if (dynamicMeshes.jupiterCloudsWestMesh) dynamicMeshes.jupiterCloudsWestMesh.rotation.y -= 0.03 * deltaTime;
      if (dynamicMeshes.saturnCloudsMesh) dynamicMeshes.saturnCloudsMesh.rotation.y += 0.025 * deltaTime;
      if (dynamicMeshes.uranusCloudsMesh) dynamicMeshes.uranusCloudsMesh.rotation.y += 0.018 * deltaTime;
      if (dynamicMeshes.neptuneCloudsMesh) dynamicMeshes.neptuneCloudsMesh.rotation.y += 0.022 * deltaTime;
      if (dynamicMeshes.neptuneCirrusMesh) dynamicMeshes.neptuneCirrusMesh.rotation.y += 0.06 * deltaTime;
      if (dynamicMeshes.marsDustMesh) dynamicMeshes.marsDustMesh.rotation.y += 0.006 * deltaTime;

      if (dynamicMeshes.venusLightningLight) {
        dynamicMeshes.venusLightningLight.intensity = Math.random() < 0.04 ? 12.0 : 0;
      }

      // Toggle Constellations
      if (constellationsGroup) {
        constellationsGroup.visible = !!isConstellationsOpenRef.current;
      }

      // Animate Probes & Deep Space
      if (planetMeshes.iss && planetMeshes.iss.parent && planetMeshes.iss.parent.userData.issPivot) {
        planetMeshes.iss.parent.userData.issPivot.rotation.y += 0.25 * deltaTime * currentSpeed;
      }
      if (voyager1PulseMesh) {
        const pScale = 1.0 + (time * 2.0) % 2.5;
        voyager1PulseMesh.scale.setScalar(pScale);
        voyager1PulseMesh.material.opacity = Math.max(0, 1.0 - (pScale - 1.0) / 2.5);
      }

      if (sagittariusACoreMesh) sagittariusACoreMesh.rotation.y += 0.4 * deltaTime;
      if (trapeziumStarsGroup) trapeziumStarsGroup.rotation.y += 0.05 * deltaTime;
      if (blackHoleAccretionRing) blackHoleAccretionRing.rotation.z += 0.15 * deltaTime;

      // Cutaway Visibility
      const isCutawayActive = isCutawayOpenRef.current;
      const activeSelectedKey = selectedBodyKeyRef.current;

      Object.keys(planetMeshes).forEach(k => {
        const m = planetMeshes[k];
        if (m && m.userData && m.userData.cutawayGroup) {
          const showCutaway = isCutawayActive && (activeSelectedKey === k);
          m.userData.cutawayGroup.visible = showCutaway;
          if (m.material) m.material.visible = !showCutaway;

          if (k === 'earth') {
            if (dynamicMeshes.earthCloudsMesh) dynamicMeshes.earthCloudsMesh.visible = !showCutaway;
            if (dynamicMeshes.earthRayleighMesh) dynamicMeshes.earthRayleighMesh.visible = !showCutaway;
          }
          if (k === 'venus' && dynamicMeshes.venusCloudsMesh) dynamicMeshes.venusCloudsMesh.visible = !showCutaway;
          if (k === 'jupiter') {
            if (dynamicMeshes.jupiterCloudsEastMesh) dynamicMeshes.jupiterCloudsEastMesh.visible = !showCutaway;
            if (dynamicMeshes.jupiterCloudsWestMesh) dynamicMeshes.jupiterCloudsWestMesh.visible = !showCutaway;
          }
          if (k === 'saturn' && dynamicMeshes.saturnCloudsMesh) dynamicMeshes.saturnCloudsMesh.visible = !showCutaway;
          if (k === 'uranus' && dynamicMeshes.uranusCloudsMesh) dynamicMeshes.uranusCloudsMesh.visible = !showCutaway;
          if (k === 'neptune') {
            if (dynamicMeshes.neptuneCloudsMesh) dynamicMeshes.neptuneCloudsMesh.visible = !showCutaway;
            if (dynamicMeshes.neptuneCirrusMesh) dynamicMeshes.neptuneCirrusMesh.visible = !showCutaway;
          }
        }
      });

      // Animate Comet
      if (cometMesh) {
        const cx = Math.sin(time * 0.3) * 60;
        const cy = Math.cos(time * 0.2) * 20;
        const cz = Math.sin(time * 0.15) * 50;
        cometMesh.position.set(cx, cy, cz);

        if (cometComaMesh) {
          cometComaMesh.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.15);
        }

        cometHistory.unshift({ x: cx, y: cy, z: cz });
        if (cometHistory.length > cometTailCount) cometHistory.pop();

        const tailPositions = cometTailGeo.attributes.position.array;
        for (let i = 0; i < cometHistory.length; i++) {
          tailPositions[i * 3] = cometHistory[i].x;
          tailPositions[i * 3 + 1] = cometHistory[i].y;
          tailPositions[i * 3 + 2] = cometHistory[i].z;
        }
        cometTailGeo.attributes.position.needsUpdate = true;
      }

      // Rotate Instanced Belts
      for (let i = 0; i < astCount; i++) {
        const item = asteroidData[i];
        item.angle += 0.02 * currentSpeed * deltaTime;
        dummy.position.set(Math.cos(item.angle) * item.radius, item.y, Math.sin(item.angle) * item.radius);
        dummy.rotation.copy(item.rot);
        dummy.updateMatrix();
        instancedAsteroids.setMatrixAt(i, dummy.matrix);
      }
      instancedAsteroids.instanceMatrix.needsUpdate = true;

      if (zoomDistanceRef.current > 35.0 || selectedBodyKeyRef.current === 'kuiperbelt' || selectedBodyKeyRef.current === 'pluto') {
        for (let i = 0; i < kuiperCount; i++) {
          const item = kuiperList[i];
          item.angle += 0.005 * currentSpeed * deltaTime;
          dummy.position.set(Math.cos(item.angle) * item.radius, item.y, Math.sin(item.angle) * item.radius);
          dummy.rotation.copy(item.rot);
          dummy.updateMatrix();
          instancedKuiper.setMatrixAt(i, dummy.matrix);
        }
        instancedKuiper.instanceMatrix.needsUpdate = true;
      }

      // Rotate Galaxies
      galaxyGroup.rotation.y += 0.008 * deltaTime;
      androGroup.rotation.y += 0.006 * deltaTime;
      nebulaGroup.rotation.y += 0.004 * deltaTime;

      // Orbit Planets
      const allOrbitKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
      allOrbitKeys.forEach(key => {
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
      targetPosVec.set(0, 0, 0);
      const currentSelectedKey = selectedBodyKeyRef.current;

      if (currentSelectedKey !== prevSelectedKey) {
        prevSelectedKey = currentSelectedKey;
        sphericalAngleRef.current = { theta: 0.3, phi: Math.PI / 2.4 };
        const targetData = SPACE_DATA[currentSelectedKey];
        if (targetData) {
          if (currentSelectedKey === 'solarsystem') {
            targetZoomDistanceRef.current = 55.0;
          } else if (currentSelectedKey === 'kuiperbelt') {
            targetZoomDistanceRef.current = 65.0;
          } else if (currentSelectedKey === 'galaxy') {
            targetZoomDistanceRef.current = 75.0;
          } else if (currentSelectedKey === 'andromeda') {
            targetZoomDistanceRef.current = 55.0;
          } else if (currentSelectedKey === 'nebula') {
            targetZoomDistanceRef.current = 45.0;
          } else if (currentSelectedKey === 'blackhole') {
            targetZoomDistanceRef.current = 24.0;
          } else if (currentSelectedKey === 'voyager1') {
            targetZoomDistanceRef.current = 10.0;
          } else if (currentSelectedKey === 'iss') {
            targetZoomDistanceRef.current = 8.0;
          } else {
            targetZoomDistanceRef.current = targetData.size ? Math.max(3.5, targetData.size * 4.5) : 30;
          }
        }
      }

      if (currentSelectedKey === 'solarsystem') {
        targetPosVec.set(0, 0, 0);
        cameraFillLight.position.set(10, 20, 20);
      } else if (currentSelectedKey && planetMeshes[currentSelectedKey]) {
        const targetMesh = planetMeshes[currentSelectedKey];
        targetMesh.getWorldPosition(targetPosVec);
        cameraFillLight.position.set(targetPosVec.x + 10, targetPosVec.y + 15, targetPosVec.z + 20);
      }

      if (Math.abs(zoomVelocityRef.current) > 0.001) {
        targetZoomDistanceRef.current = zoomDistanceRef.current + zoomVelocityRef.current;
      }

      zoomDistanceRef.current += (targetZoomDistanceRef.current - zoomDistanceRef.current) * 0.12;

      zoomDistanceRef.current = THREE.MathUtils.clamp(
        zoomDistanceRef.current + zoomVelocityRef.current,
        2.0,
        250.0
      );
      zoomVelocityRef.current *= 0.88;

      cameraTargetRef.current.lerp(targetPosVec, 0.15);

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

      if (setRenderStats && Math.random() < 0.05) {
        setRenderStats({
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures
        });
      }
    };

    animate();

    const handleResize = () => {
      width = mountRef.current ? mountRef.current.clientWidth : window.innerWidth;
      height = mountRef.current ? mountRef.current.clientHeight : window.innerHeight;
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

      sceneResources.forEach(res => {
        if (res && res.dispose) res.dispose();
      });

      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
