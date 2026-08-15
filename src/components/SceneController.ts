import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import confetti from 'canvas-confetti';
import { BunnyModel } from './BunnyModel';
import { MeadowEnvironment, CarrotItem } from './MeadowEnvironment';
import { LightingRig } from './LightingRig';
import { BunnyBreed, CameraPreset, EnvironmentConfig, LightingConfig, TimeOfDayPreset } from '../types';
import { soundFx } from '../utils/audioSynthesizer';

export class SceneController {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  public bunny: BunnyModel;
  public meadow: MeadowEnvironment;
  public lighting: LightingRig;

  private container: HTMLElement;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetLookAt: THREE.Vector3 | null = null;

  public onStatsUpdate?: (happiness: number, carrots: number) => void;
  public happiness: number = 85;
  public carrotsEaten: number = 0;

  private envConfig: EnvironmentConfig = {
    windSpeed: 1.0,
    grassDensity: 1.0,
    showFlowers: true,
    showButterflies: true,
    showFireflies: true,
    showPollen: true,
    showPond: true,
  };

  private currentPreset: TimeOfDayPreset = 'sunset';

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.2, 4.2);

    // 3. Renderer with high-end realistic lighting & shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go underground
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.7, 0);

    // 5. Lighting Rig
    this.lighting = new LightingRig(this.scene);
    this.scene.add(this.lighting.group);

    // 6. Meadow Environment
    this.meadow = new MeadowEnvironment();
    this.scene.add(this.meadow.group);

    // 7. Bunny Model
    this.bunny = new BunnyModel();
    this.scene.add(this.bunny.group);

    // Attach interaction handlers
    this.bindEvents();

    // Start render loop
    this.animate();
  }

  private bindEvents() {
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('click', this.onCanvasClick);
  }

  private onPointerMove(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast to find 3D point for bunny to look at
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.meadow.terrainMesh);
    if (intersects.length > 0) {
      this.bunny.lookAtTarget.copy(intersects[0].point);
    }
  }

  private onCanvasClick(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check if clicked directly on bunny
    const bunnyHits = this.raycaster.intersectObjects(this.bunny.group.children, true);
    if (bunnyHits.length > 0) {
      this.petBunny();
      return;
    }

    // Check if clicked on terrain to spawn carrot
    const terrainHits = this.raycaster.intersectObject(this.meadow.terrainMesh);
    if (terrainHits.length > 0) {
      const p = terrainHits[0].point;
      this.dropCarrot(p.x, p.z);
    }
  }

  public dropCarrot(x: number, z: number) {
    const carrot = this.meadow.spawnCarrot(x, z);
    soundFx.playHappyChime();

    // Bunny hops toward carrot to eat it
    this.bunny.hopTo(x * 0.85, z * 0.85, () => {
      // Reached carrot
      this.bunny.triggerEat();
      soundFx.playCrunchSound();

      setTimeout(() => {
        soundFx.playCrunchSound();
      }, 400);

      setTimeout(() => {
        this.bunny.stopEat();
        this.meadow.removeCarrot(carrot);
        this.bunny.triggerEarWiggle();

        this.carrotsEaten += 1;
        this.happiness = Math.min(100, this.happiness + 5);
        if (this.onStatsUpdate) {
          this.onStatsUpdate(this.happiness, this.carrotsEaten);
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#ff9f43', '#10ac84', '#feca57'],
        });
      }, 1200);
    });
  }

  public petBunny() {
    this.bunny.triggerEarWiggle();
    soundFx.playHappyChime();
    this.happiness = Math.min(100, this.happiness + 3);
    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.happiness, this.carrotsEaten);
    }

    confetti({
      particleCount: 15,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#ff6b6b', '#feca57', '#ff9ff3'],
    });
  }

  public triggerHop() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 0.8 + Math.random() * 0.8;
    const targetX = Math.max(-2.5, Math.min(2.5, this.bunny.group.position.x + Math.cos(angle) * distance));
    const targetZ = Math.max(-2.5, Math.min(2.5, this.bunny.group.position.z + Math.sin(angle) * distance));

    soundFx.playHopSound();
    this.bunny.hopTo(targetX, targetZ);
  }

  public toggleSleep() {
    const next = !this.bunny.isSleeping;
    this.bunny.setSleeping(next);
    return next;
  }

  public setBreed(breed: BunnyBreed) {
    this.bunny.setBreed(breed);
  }

  public setTimeOfDay(preset: TimeOfDayPreset): LightingConfig {
    this.currentPreset = preset;
    const config = this.lighting.applyPreset(preset);
    soundFx.updateTimeOfDay(preset);
    return config;
  }

  public updateLighting(config: LightingConfig) {
    this.lighting.applyConfig(config);
  }

  public updateEnvironment(config: Partial<EnvironmentConfig>) {
    this.envConfig = { ...this.envConfig, ...config };

    if (this.meadow.flowersGroup) {
      this.meadow.flowersGroup.visible = this.envConfig.showFlowers;
    }
    if (this.meadow.pollenPoints) {
      this.meadow.pollenPoints.visible = this.envConfig.showPollen;
    }
    if (this.meadow.firefliesPoints) {
      this.meadow.firefliesPoints.visible = this.envConfig.showFireflies;
    }
    if (this.meadow.pondMesh) {
      this.meadow.pondMesh.visible = this.envConfig.showPond;
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    switch (preset) {
      case 'portrait':
        this.targetCameraPos = new THREE.Vector3(0, 1.1, 2.1);
        this.targetLookAt = new THREE.Vector3(0, 0.7, 0);
        break;
      case 'cinematic':
        this.targetCameraPos = new THREE.Vector3(3.2, 2.4, 4.0);
        this.targetLookAt = new THREE.Vector3(0, 0.6, 0);
        break;
      case 'macro':
        this.targetCameraPos = new THREE.Vector3(-0.6, 0.45, 1.2);
        this.targetLookAt = new THREE.Vector3(0, 0.55, 0);
        break;
      case 'birds_eye':
        this.targetCameraPos = new THREE.Vector3(0, 7.5, 4.5);
        this.targetLookAt = new THREE.Vector3(0, 0, 0);
        break;
    }
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Smooth camera transition if preset was selected
    if (this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.controls.target.lerp(this.targetLookAt, 0.06);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.targetCameraPos = null;
        this.targetLookAt = null;
      }
    }

    this.controls.update();

    // Update Bunny
    this.bunny.update(delta);

    // Update Meadow Environment
    const isNightOrTwilight = this.currentPreset === 'night' || this.currentPreset === 'twilight';
    this.meadow.update(delta, this.envConfig.windSpeed, isNightOrTwilight);

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('click', this.onCanvasClick);

    this.controls.dispose();
    this.renderer.dispose();
    if (dom.parentElement) {
      dom.parentElement.removeChild(dom);
    }
  }
}
