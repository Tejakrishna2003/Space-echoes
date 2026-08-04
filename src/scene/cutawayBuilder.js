import * as THREE from 'three';
import { getEarthBumpMap } from '../utils/planetTextureGenerator';

export function createPlanetCutawayGroup(key, size, texture, trackResource) {
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
}
