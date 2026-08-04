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
  getMercuryTexture,
  getMercuryBumpMap,
  getMercurySpecularMap,
  getMarsTexture,
  getMarsBumpMap,
  getMarsDustStormTexture,
  getJupiterTexture,
  getJupiterCloudTexture,
  getSaturnTexture,
  getSaturnCloudTexture,
  getSaturnRingTexture,
  getMoonTexture,
  getMoonBumpMap,
  getMoonSpecularMap,
  getVenusTexture,
  getIceGiantTexture,
  getUranusCloudTexture,
  getNeptuneCloudTexture,
  getBlackHoleAccretionTexture,
  getPlutoTexture
} from '../utils/planetTextureGenerator';

export default function ThreeCanvas({ selectedBodyKey, onPlanetClick, timeSpeed, setFps, isCutawayOpen, hasStarted, setRenderStats, isConstellationsOpen }) {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);

  // Smooth State Refs
  const selectedBodyKeyRef = useRef(selectedBodyKey);
  const timeSpeedRef = useRef(timeSpeed);
  const isCutawayOpenRef = useRef(isCutawayOpen);
  const isConstellationsOpenRef = useRef(isConstellationsOpen);

  useEffect(() => {
    selectedBodyKeyRef.current = selectedBodyKey;
  }, [selectedBodyKey]);

  useEffect(() => {
    timeSpeedRef.current = timeSpeed;
  }, [timeSpeed]);

  useEffect(() => {
    isCutawayOpenRef.current = isCutawayOpen;
  }, [isCutawayOpen]);

  useEffect(() => {
    isConstellationsOpenRef.current = isConstellationsOpen;
  }, [isConstellationsOpen]);

  // Cinematic Intro Fly-In Trigger
  const prevHasStartedRef = useRef(hasStarted);
  useEffect(() => {
    if (hasStarted && !prevHasStartedRef.current) {
      zoomDistanceRef.current = 140.0;
      targetZoomDistanceRef.current = 35.0;
    }
    prevHasStartedRef.current = hasStarted;
  }, [hasStarted]);

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
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
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
      0.50, 0.4, 0.82
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
    let earthRayleighMesh = null;
    let earthCutawayGroup = null;
    let solarProminenceGroup = null;
    let blackHoleAccretionRing = null;
    let cometMesh = null;
    let cometComaMesh = null;
    let venusCloudsMesh = null;
    let jupiterCloudsMesh = null;
    let saturnCloudsMesh = null;
    let uranusCloudsMesh = null;
    let neptuneCloudsMesh = null;
    let marsDustMesh = null;
    let earthAuroraNorthMesh = null;
    let earthAuroraSouthMesh = null;
    let jupiterCloudsEastMesh = null;
    let jupiterCloudsWestMesh = null;
    let venusLightningLight = null;
    let sunFlareParticles = null;
    let sunFlarePositions = null;
    let sunFlareVelocities = null;
    let neptuneCirrusMesh = null;
    let constellationsGroup = null;
    let voyager1PulseMesh = null;
    let meteorSystem = null;
    let meteorPositions = null;
    let blackHoleJetsGroup = null;
    let sagittariusACoreMesh = null;
    let trapeziumStarsGroup = null;
    let heliosphereMesh = null;

    const getTextureForPlanet = (key) => {
      switch (key) {
        case 'sun': return getSunTexture();
        case 'mercury': return getMercuryTexture(); // Phase 1 Upgrade: Custom Mercury Basalt
        case 'venus': return getVenusTexture();
        case 'earth': return getEarthTexture();
        case 'moon': return getMoonTexture();
        case 'mars': return getMarsTexture();
        case 'jupiter': return getJupiterTexture();
        case 'saturn': return getSaturnTexture();
        case 'uranus': return getIceGiantTexture('#40c4de', '#1c7a8c');
        case 'neptune': return getIceGiantTexture('#1e429f', '#0a1d4a');
        case 'pluto': return getPlutoTexture();
        default: return getEarthTexture();
      }
    };

    const createPlanetCutawayGroup = (key, size, texture) => {
      const cutawayGroup = new THREE.Group();
      cutawayGroup.visible = false;

      let layers = [];
      switch (key) {
        case 'sun':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.25, 32, 32), mat: new THREE.MeshBasicMaterial({ color: 0xffffff }) },
            { geo: new THREE.SphereGeometry(size * 0.55, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 0.85, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.5, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'mercury':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.70, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 }) },
            { geo: new THREE.SphereGeometry(size * 0.90, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.7, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, bumpMap: texture, bumpScale: 0.04, side: THREE.DoubleSide }) }
          ];
          break;
        case 'venus':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.30, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.7, roughness: 0.3 }) },
            { geo: new THREE.SphereGeometry(size * 0.80, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.6, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'earth':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.20, 32, 32), mat: new THREE.MeshBasicMaterial({ color: 0xffffff }) },
            { geo: new THREE.SphereGeometry(size * 0.42, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.3, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 0.85, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.6, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshPhongMaterial({ map: texture, bumpMap: getEarthBumpMap(), bumpScale: 0.05, side: THREE.DoubleSide }) }
          ];
          break;
        case 'moon':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.18, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.6, roughness: 0.4 }) },
            { geo: new THREE.SphereGeometry(size * 0.82, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, side: THREE.DoubleSide }) }
          ];
          break;
        case 'mars':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.30, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.7, roughness: 0.3 }) },
            { geo: new THREE.SphereGeometry(size * 0.80, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, side: THREE.DoubleSide }) }
          ];
          break;
        case 'jupiter':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.25, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }) },
            { geo: new THREE.SphereGeometry(size * 0.65, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'saturn':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.25, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }) },
            { geo: new THREE.SphereGeometry(size * 0.60, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'uranus':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.20, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }) },
            { geo: new THREE.SphereGeometry(size * 0.85, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, transparent: true, opacity: 0.85, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'neptune':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.22, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }) },
            { geo: new THREE.SphereGeometry(size * 0.85, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2, transparent: true, opacity: 0.85, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        case 'pluto':
          layers = [
            { geo: new THREE.SphereGeometry(size * 0.35, 32, 32), mat: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 }) },
            { geo: new THREE.SphereGeometry(size * 0.82, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide }) },
            { geo: new THREE.SphereGeometry(size * 1.0, 64, 64, 0, Math.PI * 1.5), mat: new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }) }
          ];
          break;
        default:
          break;
      }

      layers.forEach(l => {
        trackResource(l.geo);
        trackResource(l.mat);
        cutawayGroup.add(new THREE.Mesh(l.geo, l.mat));
      });

      return cutawayGroup;
    };

    // Procedural Soft Glowing Round Star Texture Canvas
    const createStarTexture = () => {
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
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };
    const starTexture = createStarTexture();

    // 4. Ambient Skydome Starfield (20,000 stars split into 3 magnitude size tiers)
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

    // 3D Starlight Constellations Overlay Group (Orion, Ursa Major, Cassiopeia, Scorpius)
    const createConstellations = () => {
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
    };
    constellationsGroup = createConstellations();

    // 5. The Sun
    const sunData = SPACE_DATA.sun;
    const sunGeo = trackResource(new THREE.SphereGeometry(sunData.size, 64, 64));
    const sunMat = trackResource(new THREE.MeshBasicMaterial({ map: getSunTexture() }));
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { key: 'sun', data: sunData };
    scene.add(sunMesh);
    planetMeshes.sun = sunMesh;
    interactiveObjects.push(sunMesh);

    const sunCutawayGroup = createPlanetCutawayGroup('sun', sunData.size, getSunTexture());
    sunMesh.add(sunCutawayGroup);
    sunMesh.userData.cutawayGroup = sunCutawayGroup;

    // Soft Volumetric Corona Plasma Glow
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

    // Prominence Flares & Multi-Arc Glowing Plasma Loops
    solarProminenceGroup = new THREE.Group();
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

    // 6. Planets & Multi-Moons with Axial Tilt
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
      const pData = SPACE_DATA[key];
      const pPivot = new THREE.Group();
      scene.add(pPivot);

      const pGeo = trackResource(new THREE.SphereGeometry(pData.size, 64, 64));
      const pTex = getTextureForPlanet(key);
      
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
        pMat = trackResource(new THREE.MeshPhongMaterial({
          map: pTex,
          specular: new THREE.Color(0x332211),
          shininess: 12
        }));
      } else if (key === 'saturn') {
        pMat = trackResource(new THREE.MeshPhongMaterial({
          map: pTex,
          specular: new THREE.Color(0x443311),
          shininess: 15
        }));
      } else if (key === 'uranus') {
        pMat = trackResource(new THREE.MeshPhongMaterial({
          map: pTex,
          specular: new THREE.Color(0x225566),
          shininess: 25
        }));
      } else if (key === 'neptune') {
        pMat = trackResource(new THREE.MeshPhongMaterial({
          map: pTex,
          specular: new THREE.Color(0x113366),
          shininess: 30
        }));
      } else {
        pMat = trackResource(new THREE.MeshStandardMaterial({
          map: pTex,
          roughness: 0.4,
          metalness: 0.1
        }));
      }

      // 1. Orbital Path Trajectory Ring around the Sun
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

      const pCutawayGroup = createPlanetCutawayGroup(key, pData.size, pTex);
      pMesh.add(pCutawayGroup);
      pMesh.userData = { key: key, data: pData, pivot: pPivot, cutawayGroup: pCutawayGroup };
      pPivot.add(pMesh);
      planetMeshes[key] = pMesh;
      interactiveObjects.push(pMesh);

      if (key === 'earth') {
        earthCutawayGroup = pCutawayGroup;
      }

      // Helper function to create custom Rayleigh limb shaders
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

      // Mercury Exosphere Limb Halo
      if (key === 'mercury') {
        const mercHalo = createLimbShader(0xa0a0a0, 0.12, 1.03);
        pMesh.add(mercHalo);
      }

      // Venus Thick Rotating Sulfurous Cloud Shell & Atmosphere Lightning
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
        venusCloudsMesh = new THREE.Mesh(vCloudGeo, vCloudMat);
        venusCloudsMesh.renderOrder = 2;
        pMesh.add(venusCloudsMesh);

        venusLightningLight = trackResource(new THREE.PointLight(0xffff55, 0, 15));
        venusLightningLight.position.set(0, pData.size * 0.8, pData.size * 0.8);
        pMesh.add(venusLightningLight);

        pMesh.add(createLimbShader(0xffcc44, 0.35, 1.05));
      }

      // Mars Thin Rusty Atmosphere Limb Glow Shader & Dust Storm Shell
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
        marsDustMesh = new THREE.Mesh(mDustGeo, mDustMat);
        pMesh.add(marsDustMesh);
      }

      // Hyper-Real Earth: Clouds, Atmosphere Shader & Polar Auroras
      if (key === 'earth') {
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

        earthRayleighMesh = createLimbShader(0x0077ff, 0.45, 1.05);
        earthRayleighMesh.renderOrder = 3;
        pMesh.add(earthRayleighMesh);

        // ISS (International Space Station) Orbiting Earth
        const issPivot = new THREE.Group();
        pMesh.add(issPivot);

        const issGroup = new THREE.Group();
        const trussGeo = trackResource(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8));
        const trussMat = trackResource(new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 }));
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

        issGroup.position.x = pData.size * 1.35;
        issPivot.add(issGroup);
        pMesh.userData.issPivot = issPivot;
        issGroup.userData = { key: 'iss', data: SPACE_DATA.iss, parentMesh: pMesh };
        planetMeshes.iss = issGroup;
        interactiveObjects.push(issGroup);
      }

      // Jupiter: Dual Counter-Rotating Cloud Bands & Amber Atmosphere Halo
      if (key === 'jupiter') {
        const jCloudGeo1 = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
        const jCloudMat1 = trackResource(new THREE.MeshStandardMaterial({
          map: getJupiterCloudTexture(),
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        jupiterCloudsEastMesh = new THREE.Mesh(jCloudGeo1, jCloudMat1);
        pMesh.add(jupiterCloudsEastMesh);

        const jCloudGeo2 = trackResource(new THREE.SphereGeometry(pData.size * 1.020, 64, 64));
        const jCloudMat2 = trackResource(new THREE.MeshStandardMaterial({
          map: getJupiterCloudTexture(),
          transparent: true,
          opacity: 0.35,
          blending: THREE.NormalBlending,
          depthWrite: false
        }));
        jupiterCloudsWestMesh = new THREE.Mesh(jCloudGeo2, jCloudMat2);
        pMesh.add(jupiterCloudsWestMesh);

        pMesh.add(createLimbShader(0xffaa44, 0.30, 1.04));
      }

      // Saturn: Golden Cloud Band Shell & Pale Gold Halo
      if (key === 'saturn') {
        const sCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
        const sCloudMat = trackResource(new THREE.MeshStandardMaterial({
          map: getSaturnCloudTexture(),
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        saturnCloudsMesh = new THREE.Mesh(sCloudGeo, sCloudMat);
        pMesh.add(saturnCloudsMesh);
        pMesh.add(createLimbShader(0xeab308, 0.25, 1.04));
      }

      // Uranus: Methane Ice Cloud Haze & Cyan Halo
      if (key === 'uranus') {
        const uCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
        const uCloudMat = trackResource(new THREE.MeshStandardMaterial({
          map: getUranusCloudTexture(),
          transparent: true,
          opacity: 0.40,
          blending: THREE.NormalBlending,
          depthWrite: false
        }));
        uranusCloudsMesh = new THREE.Mesh(uCloudGeo, uCloudMat);
        pMesh.add(uranusCloudsMesh);
        pMesh.add(createLimbShader(0x06b6d4, 0.35, 1.04));
      }

      // Neptune: Deep Cobalt Cloud Shell, Cirrus Cloud Streaks & Blue Halo
      if (key === 'neptune') {
        const nCloudGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.015, 64, 64));
        const nCloudMat = trackResource(new THREE.MeshStandardMaterial({
          map: getNeptuneCloudTexture(),
          transparent: true,
          opacity: 0.45,
          blending: THREE.NormalBlending,
          depthWrite: false
        }));
        neptuneCloudsMesh = new THREE.Mesh(nCloudGeo, nCloudMat);
        pMesh.add(neptuneCloudsMesh);

        const nCirrusGeo = trackResource(new THREE.SphereGeometry(pData.size * 1.022, 64, 64));
        const nCirrusMat = trackResource(new THREE.MeshStandardMaterial({
          map: getNeptuneCloudTexture(),
          transparent: true,
          opacity: 0.50,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        neptuneCirrusMesh = new THREE.Mesh(nCirrusGeo, nCirrusMat);
        pMesh.add(neptuneCirrusMesh);

        pMesh.add(createLimbShader(0x2563eb, 0.40, 1.04));
      }

      // 2. Earth's Moon (Luna) & Orbit Ring Path
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
        const moonCutawayGroup = createPlanetCutawayGroup('moon', SPACE_DATA.moon.size, getMoonTexture());
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

      // 3. Extra Moons (Mars, Jupiter, Neptune) & Orbit Paths
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

      // Atmospheric Rim Glow for Gas Giants & Venus
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

      // Saturn & Uranus Rings
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

    // 7. Instanced Asteroid Belt (Between Mars 14.5 and Jupiter 26.0)
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

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 UPGRADE: KUIPER BELT & OORT CLOUD (Outer Realm Asteroid Ring)
    // ─────────────────────────────────────────────────────────────────────────
    const kuiperData = SPACE_DATA.kuiperbelt;

    // Delicate Circumstellar Kuiper Belt Trajectory Ring
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

    // Natural Icy Asteroids
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

    // Oort Cloud Diffuse Spherical Shell (Subtle Cometary Particles)
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

    // ─────────────────────────────────────────────────────────────────────────
    // PLUTO DWARF PLANET & CHARON MOON (Kuiper Belt Jewel)
    // ─────────────────────────────────────────────────────────────────────────
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
      const plutoCutawayGroup = createPlanetCutawayGroup('pluto', plutoData.size, getPlutoTexture());
      plutoMesh.add(plutoCutawayGroup);
      plutoMesh.userData = { key: 'pluto', data: plutoData, pivot: plutoPivot, cutawayGroup: plutoCutawayGroup };
      plutoPivot.add(plutoMesh);
      planetMeshes.pluto = plutoMesh;
      interactiveObjects.push(plutoMesh);

      // Charon Moon
      const charonPivot = new THREE.Group();
      plutoMesh.add(charonPivot);
      const charonMesh = new THREE.Mesh(
        trackResource(new THREE.SphereGeometry(0.09, 16, 16)),
        trackResource(new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 }))
      );
      charonMesh.position.x = 0.7;
      charonPivot.add(charonMesh);
      plutoMesh.userData.extraMoonPivots = [{ pivot: charonPivot, speed: 0.04 }];

      // Pluto Orbital Path Ring
      const plutoOrbitPathMesh = new THREE.Mesh(
        trackResource(new THREE.RingGeometry(plutoData.orbitRadius - 0.04, plutoData.orbitRadius + 0.04, 128)),
        trackResource(new THREE.MeshBasicMaterial({ color: 0xc29b7f, side: THREE.DoubleSide, transparent: true, opacity: 0.25, depthWrite: false }))
      );
      plutoOrbitPathMesh.rotation.x = Math.PI / 2;
      scene.add(plutoOrbitPathMesh);
    }

    // Voyager 1 Interstellar Deep Space Probe Setup
    const voyagerData = SPACE_DATA.voyager1;
    if (voyagerData) {
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
      voyager1PulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      vGroup.add(voyager1PulseMesh);

      vGroup.position.set(110.0, 15.0, -25.0);
      vGroup.userData = { key: 'voyager1', data: voyagerData };
      scene.add(vGroup);
      planetMeshes.voyager1 = vGroup;
      interactiveObjects.push(vGroup);
    }

    // Register Kuiper Belt Pivot for target camera navigation
    // Target hit meshes for deep space objects (using tight precise core sizes to prevent background raycast hijacking)
    const kuiperMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(6.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
    kuiperMesh.position.set(0, 0, 65.0);
    kuiperMesh.userData = { key: 'kuiperbelt', data: kuiperData };
    scene.add(kuiperMesh);
    planetMeshes.kuiperbelt = kuiperMesh;
    interactiveObjects.push(kuiperMesh);

    // ─────────────────────────────────────────────────────────────────────────
    // 8. MILKY WAY GALAXY
    // ─────────────────────────────────────────────────────────────────────────
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

        // Realistic arm star color: inner warm yellow-white, outer hot blue, red giant pockets
        const starRand = Math.random();
        if (r < 40) {
          mixedColor.setHSL(0.10 + Math.random() * 0.05, 0.8, 0.72 + Math.random() * 0.2); // inner: warm yellow-white
        } else if (starRand < 0.15) {
          mixedColor.setHSL(0.02 + Math.random() * 0.03, 0.9, 0.65 + Math.random() * 0.2); // red giant pocket
        } else {
          mixedColor.setHSL(0.57 + Math.random() * 0.09, 0.85, 0.78 + Math.random() * 0.2); // outer: hot blue-white
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
    sagittariusACoreMesh = new THREE.Mesh(sagAAccretionGeo, sagAAccretionMat);
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

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 UPGRADE: DEEP SPACE NEBULAE (M42 Stellar Nursery)
    // ─────────────────────────────────────────────────────────────────────────
    const nebulaData = SPACE_DATA.nebula;
    const nebulaGroup = new THREE.Group();
    nebulaGroup.position.set(120, 20, -180);
    scene.add(nebulaGroup);

    // Outer wispy lobe shell (4,500 particles — hydrogen purple + oxygen teal)
    const nebParticleCount = 4500;
    const nebGeo = trackResource(new THREE.BufferGeometry());
    const nebPos = new Float32Array(nebParticleCount * 3);
    const nebCols = new Float32Array(nebParticleCount * 3);

    for (let i = 0; i < nebParticleCount; i++) {
      // Bilobed wispy structure: 2 ellipsoidal lobes
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
        col.setHSL(0.80 + Math.random() * 0.10, 0.95, 0.58 + Math.random() * 0.25); // Hydrogen-alpha magenta/violet
      } else if (nebRand < 0.85) {
        col.setHSL(0.50 + Math.random() * 0.08, 0.90, 0.62 + Math.random() * 0.2); // OIII teal/cyan
      } else {
        col.setHSL(0.02 + Math.random() * 0.04, 0.90, 0.65 + Math.random() * 0.2); // SII red
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

    // Dense bright emission core (1,200 particles)
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

    // Trapezium Star Quadruplet (4 O-Type Supergiant Stars illuminating Orion Nebula)
    trapeziumStarsGroup = new THREE.Group();
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

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 UPGRADE: ANDROMEDA GALAXY (M31)
    // ─────────────────────────────────────────────────────────────────────────
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
        // Central bulge: warm golden-orange stars
        const r = Math.random() * 12;
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r * 1.5 + (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * (r * 0.35);
        z = Math.sin(theta) * r * 0.8 + (Math.random() - 0.5) * 2;
        androColor.setHSL(0.09 + Math.random() * 0.06, 0.9, 0.68 + Math.random() * 0.2);
      } else {
        // Spiral arms: 4-arm structure tilted (Andromeda seen at ~77° angle)
        const r = 10 + Math.random() * 58;
        const spinAngle = r * 0.10;
        const armsCount = 4;
        const armOffset = (i % armsCount) * ((Math.PI * 2) / armsCount);
        x = Math.cos(armOffset + spinAngle) * r + (Math.random() - 0.5) * (r * 0.10);
        y = (Math.random() - 0.5) * (r * 0.09);
        z = Math.sin(armOffset + spinAngle) * r * 0.55 + (Math.random() - 0.5) * (r * 0.08);

        const andRand = Math.random();
        if (andRand < 0.60) {
          androColor.setHSL(0.60 + Math.random() * 0.08, 0.80, 0.76 + Math.random() * 0.2); // blue-white
        } else if (andRand < 0.85) {
          androColor.setHSL(0.10 + Math.random() * 0.05, 0.75, 0.72 + Math.random() * 0.2); // warm yellow
        } else {
          androColor.setHSL(0.02 + Math.random() * 0.03, 0.9, 0.65 + Math.random() * 0.15); // red giants
        }
      }

      androPos[i * 3] = x;
      androPos[i * 3 + 1] = y;
      androPos[i * 3 + 2] = z;

      androCols[i * 3] = androColor.r;
      androCols[i * 3 + 1] = androColor.g;
      androCols[i * 3 + 2] = androColor.b;
    }
    androGroup.add(new THREE.Points(androGeo, trackResource(new THREE.PointsMaterial({
      size: 0.7,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))));

    // Satellite Dwarf Galaxies M32 & M110 orbiting Andromeda halo
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

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 3 UPGRADE: SUPERMASSIVE BLACK HOLE & ACCRETION DISK
    // ─────────────────────────────────────────────────────────────────────────
    const bhData = SPACE_DATA.blackhole;
    const bhGroup = new THREE.Group();
    bhGroup.position.set(220, 0, -120);
    scene.add(bhGroup);

    // Event Horizon Solid Black Sphere
    const eventHorizonMesh = new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(bhData.size, 64, 64)),
      trackResource(new THREE.MeshBasicMaterial({ color: 0x000000 }))
    );
    bhGroup.add(eventHorizonMesh);

    // Relativistic Accretion Ring
    blackHoleAccretionRing = new THREE.Mesh(
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
    bhGroup.add(gravitationalLensMesh);

    const bhTargetMesh = new THREE.Mesh(trackResource(new THREE.SphereGeometry(5.0, 16, 16)), trackResource(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })));
    bhTargetMesh.position.copy(bhGroup.position);
    bhTargetMesh.userData = { key: 'blackhole', data: bhData };
    scene.add(bhTargetMesh);
    planetMeshes.blackhole = bhTargetMesh;
    interactiveObjects.push(bhTargetMesh);

    // ─────────────────────────────────────────────────────────────────────────
    // PHASE 4 POLISH: ANIMATED COMET WITH DYNAMIC TAIL
    // ─────────────────────────────────────────────────────────────────────────
    cometMesh = new THREE.Mesh(
      trackResource(new THREE.SphereGeometry(0.35, 16, 16)),
      trackResource(new THREE.MeshBasicMaterial({ color: 0xe0f2fe }))
    );
    scene.add(cometMesh);

    cometComaMesh = new THREE.Mesh(
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
    const cometHistory = [];

    // 9. Interaction, Controls & Touch Support
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let pointerDownPosition = { x: 0, y: 0 };
    let initialPinchDistance = 0;

    const handlePointerDown = (e) => {
      if (e.target.tagName === 'CANVAS') {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        pointerDownPosition = { x: e.clientX, y: e.clientY };
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
        pointerDownPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
      
      // Ignore click event if user was dragging/rotating/zooming the camera (>6px move)
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

    // 10. Delta Time Render Loop
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

      // FPS Calculation
      frameCount++;
      if (now - lastTime >= 1000) {
        if (setFps) setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Rotate Sun Core & Prominences + Solar Breathing Pulse
      sunMesh.rotation.y += 0.05 * deltaTime;
      sunMesh.scale.setScalar(1.0 + Math.sin(time * 1.5) * 0.012);
      if (solarProminenceGroup) {
        solarProminenceGroup.rotation.z += 0.1 * deltaTime;
        solarProminenceGroup.rotation.x += 0.05 * deltaTime;
      }

      // Rotate Planet Clouds & Atmosphere Layers
      if (earthCloudsMesh) earthCloudsMesh.rotation.y += 0.08 * deltaTime;
      if (venusCloudsMesh) venusCloudsMesh.rotation.y += 0.015 * deltaTime;
      if (jupiterCloudsMesh) jupiterCloudsMesh.rotation.y += 0.04 * deltaTime;
      if (jupiterCloudsEastMesh) jupiterCloudsEastMesh.rotation.y += 0.05 * deltaTime;
      if (jupiterCloudsWestMesh) jupiterCloudsWestMesh.rotation.y -= 0.03 * deltaTime;
      if (saturnCloudsMesh) saturnCloudsMesh.rotation.y += 0.025 * deltaTime;
      if (uranusCloudsMesh) uranusCloudsMesh.rotation.y += 0.018 * deltaTime;
      if (neptuneCloudsMesh) neptuneCloudsMesh.rotation.y += 0.022 * deltaTime;
      if (neptuneCirrusMesh) neptuneCirrusMesh.rotation.y += 0.06 * deltaTime;
      if (marsDustMesh) marsDustMesh.rotation.y += 0.006 * deltaTime;

      // Venus Cloud Electrical Lightning Sparks
      if (venusLightningLight) {
        venusLightningLight.intensity = Math.random() < 0.04 ? 12.0 : 0;
      }

      // Toggle 3D Constellations Overlay
      if (constellationsGroup) {
        constellationsGroup.visible = !!isConstellationsOpenRef.current;
      }

      // Animate ISS Satellite & Voyager 1 Radio Pulse Ring
      if (planetMeshes.iss && planetMeshes.iss.parent && planetMeshes.iss.parent.userData.issPivot) {
        planetMeshes.iss.parent.userData.issPivot.rotation.y += 0.25 * deltaTime * currentSpeed;
      }
      if (voyager1PulseMesh) {
        const pScale = 1.0 + (time * 2.0) % 2.5;
        voyager1PulseMesh.scale.setScalar(pScale);
        voyager1PulseMesh.material.opacity = Math.max(0, 1.0 - (pScale - 1.0) / 2.5);
      }

      // Animate Deep Space Realm Features (Sagittarius A*, Trapezium Stars)
      if (sagittariusACoreMesh) sagittariusACoreMesh.rotation.y += 0.4 * deltaTime;
      if (trapeziumStarsGroup) trapeziumStarsGroup.rotation.y += 0.05 * deltaTime;

      // Toggle 3D Internal Core Cutaway Mode View for All Planets & Sun
      const isCutawayActive = isCutawayOpenRef.current;
      const activeSelectedKey = selectedBodyKeyRef.current;

      Object.keys(planetMeshes).forEach(k => {
        const m = planetMeshes[k];
        if (m && m.userData && m.userData.cutawayGroup) {
          const showCutaway = isCutawayActive && (activeSelectedKey === k);
          m.userData.cutawayGroup.visible = showCutaway;
          if (m.material) m.material.visible = !showCutaway;

          if (k === 'earth') {
            if (earthCloudsMesh) earthCloudsMesh.visible = !showCutaway;
            if (earthRayleighMesh) earthRayleighMesh.visible = !showCutaway;
          }
          if (k === 'venus' && venusCloudsMesh) venusCloudsMesh.visible = !showCutaway;
          if (k === 'jupiter') {
            if (jupiterCloudsEastMesh) jupiterCloudsEastMesh.visible = !showCutaway;
            if (jupiterCloudsWestMesh) jupiterCloudsWestMesh.visible = !showCutaway;
          }
          if (k === 'saturn' && saturnCloudsMesh) saturnCloudsMesh.visible = !showCutaway;
          if (k === 'uranus' && uranusCloudsMesh) uranusCloudsMesh.visible = !showCutaway;
          if (k === 'neptune') {
            if (neptuneCloudsMesh) neptuneCloudsMesh.visible = !showCutaway;
            if (neptuneCirrusMesh) neptuneCirrusMesh.visible = !showCutaway;
          }
          if (k === 'mars' && marsDustMesh) marsDustMesh.visible = !showCutaway;

          if (showCutaway) {
            m.userData.cutawayGroup.rotation.y += 0.2 * deltaTime;
          }
        }
      });

      // Rotate Black Hole Accretion Disk
      if (blackHoleAccretionRing) {
        blackHoleAccretionRing.rotation.z += 0.4 * deltaTime;
      }

      // Animate Comet Trajectory, Particle Tail & Coma Glow Pulse
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

      // Rotate Instanced Asteroids (Main Belt + Kuiper Belt)
      for (let i = 0; i < astCount; i++) {
        const item = asteroidData[i];
        item.angle += 0.02 * currentSpeed * deltaTime;
        dummy.position.set(Math.cos(item.angle) * item.radius, item.y, Math.sin(item.angle) * item.radius);
        dummy.rotation.copy(item.rot);
        dummy.updateMatrix();
        instancedAsteroids.setMatrixAt(i, dummy.matrix);
      }
      instancedAsteroids.instanceMatrix.needsUpdate = true;

      // Kuiper Belt Zone Culling Performance Optimization
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

      // Rotate Galaxies & Nebulae
      galaxyGroup.rotation.y += 0.008 * deltaTime;
      androGroup.rotation.y += 0.006 * deltaTime;
      nebulaGroup.rotation.y += 0.004 * deltaTime;

      // Orbit Planets, Pluto & Extra Moons
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
