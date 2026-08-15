import * as THREE from 'three';
import { LightingConfig, TimeOfDayPreset } from '../types';

export class LightingRig {
  public group: THREE.Group;
  public sunLight: THREE.DirectionalLight;
  public hemisphereLight: THREE.HemisphereLight;
  public rimLight: THREE.DirectionalLight;
  public fillLight: THREE.PointLight;
  public skyDome: THREE.Mesh;
  public fog: THREE.FogExp2;

  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'LightingRig';

    // 1. Directional Sun/Moon Light with high-fidelity soft shadow map
    this.sunLight = new THREE.DirectionalLight(0xfffae6, 2.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 30;

    const d = 8;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;

    this.group.add(this.sunLight);
    this.group.add(this.sunLight.target);

    // 2. Hemisphere Light (sky/ground ambient scattering)
    this.hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0x3b6622, 0.7);
    this.group.add(this.hemisphereLight);

    // 3. Rim / Back Light (fur edge highlight)
    this.rimLight = new THREE.DirectionalLight(0xffeedd, 0.6);
    this.group.add(this.rimLight);

    // 4. Subtle fill point light near center
    this.fillLight = new THREE.PointLight(0xffffff, 0.3, 10);
    this.fillLight.position.set(0, 1.5, 2);
    this.group.add(this.fillLight);

    // 5. Sky Dome Geometry
    const skyGeo = new THREE.SphereGeometry(60, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(this.skyDome);

    // 6. Fog
    this.fog = new THREE.FogExp2(0xd6e8fa, 0.018);
    this.scene.fog = this.fog;

    this.applyPreset('sunset');
  }

  public applyConfig(config: LightingConfig) {
    // Calculate sun position from elevation and azimuth (in radians)
    const elevRad = THREE.MathUtils.degToRad(config.sunElevation);
    const azimRad = THREE.MathUtils.degToRad(config.sunAzimuth);

    const radius = 18;
    const sunX = radius * Math.cos(elevRad) * Math.sin(azimRad);
    const sunY = radius * Math.sin(elevRad);
    const sunZ = radius * Math.cos(elevRad) * Math.cos(azimRad);

    this.sunLight.position.set(sunX, Math.max(0.5, sunY), sunZ);
    this.sunLight.intensity = config.sunIntensity;
    this.sunLight.color.set(config.sunColor);
    this.sunLight.castShadow = config.shadowsEnabled;

    // Opposite angle for rim light
    this.rimLight.position.set(-sunX * 0.7, sunY * 0.5 + 2, -sunZ * 0.7);
    this.rimLight.intensity = config.rimLightIntensity;

    this.hemisphereLight.color.set(config.skyColor);
    this.hemisphereLight.groundColor.set(config.groundColor);
    this.hemisphereLight.intensity = config.ambientIntensity;

    this.skyDome.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.skyColor),
      side: THREE.BackSide,
    });

    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).density = config.fogDensity;
      (this.scene.fog as THREE.FogExp2).color.set(config.skyColor);
    }
  }

  public getPresetConfig(preset: TimeOfDayPreset): LightingConfig {
    switch (preset) {
      case 'dawn':
        return {
          timeOfDay: 'dawn',
          sunElevation: 18,
          sunAzimuth: 75,
          sunIntensity: 1.8,
          sunColor: '#ffb088',
          skyColor: '#cfbaf0',
          groundColor: '#4a6b32',
          ambientIntensity: 0.8,
          shadowIntensity: 0.75,
          shadowSoftness: 1.0,
          shadowsEnabled: true,
          rimLightIntensity: 0.8,
          fogDensity: 0.022,
        };
      case 'noon':
        return {
          timeOfDay: 'noon',
          sunElevation: 68,
          sunAzimuth: 180,
          sunIntensity: 2.8,
          sunColor: '#fff9e6',
          skyColor: '#70c1ff',
          groundColor: '#366e20',
          ambientIntensity: 1.0,
          shadowIntensity: 0.9,
          shadowSoftness: 1.0,
          shadowsEnabled: true,
          rimLightIntensity: 0.5,
          fogDensity: 0.012,
        };
      case 'sunset':
        return {
          timeOfDay: 'sunset',
          sunElevation: 14,
          sunAzimuth: 240,
          sunIntensity: 2.4,
          sunColor: '#ff7733',
          skyColor: '#f79d65',
          groundColor: '#473c24',
          ambientIntensity: 0.85,
          shadowIntensity: 0.8,
          shadowSoftness: 1.2,
          shadowsEnabled: true,
          rimLightIntensity: 1.2,
          fogDensity: 0.016,
        };
      case 'twilight':
        return {
          timeOfDay: 'twilight',
          sunElevation: 5,
          sunAzimuth: 275,
          sunIntensity: 0.8,
          sunColor: '#d16ba5',
          skyColor: '#2b2d42',
          groundColor: '#1d2a1b',
          ambientIntensity: 0.5,
          shadowIntensity: 0.5,
          shadowSoftness: 1.5,
          shadowsEnabled: true,
          rimLightIntensity: 0.6,
          fogDensity: 0.025,
        };
      case 'night':
        return {
          timeOfDay: 'night',
          sunElevation: 42,
          sunAzimuth: 310,
          sunIntensity: 0.6,
          sunColor: '#8ecae6', // Silver moonlight
          skyColor: '#0b132b', // Deep midnight blue
          groundColor: '#0f1a14',
          ambientIntensity: 0.35,
          shadowIntensity: 0.6,
          shadowSoftness: 1.8,
          shadowsEnabled: true,
          rimLightIntensity: 0.4,
          fogDensity: 0.028,
        };
    }
  }

  public applyPreset(preset: TimeOfDayPreset) {
    const config = this.getPresetConfig(preset);
    this.applyConfig(config);
    return config;
  }
}
