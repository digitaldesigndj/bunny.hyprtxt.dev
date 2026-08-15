import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import confetti from 'canvas-confetti';
import { BunnyModel } from './BunnyModel';
import { MeadowEnvironment, CarrotItem } from './MeadowEnvironment';
import { LightingRig } from './LightingRig';
import { BunnyBreed, BunnyData, CameraPreset, EnvironmentConfig, LightingConfig, TimeOfDayPreset } from '../types';
import { soundFx } from '../utils/audioSynthesizer';

const BUNNY_NAMES = [
  'Snowdrop',
  'Bramble',
  'Clover',
  'Hazel',
  'Pippin',
  'Nutmeg',
  'Onyx',
  'Mochi',
  'Buttercup',
  'Willow',
  'Thumper',
  'Dandelion',
  'Cocoa',
  'Barnaby',
  'Petal',
];

const BREED_ROTATION: BunnyBreed[] = [
  'cotton_white',
  'holland_lop',
  'cinnamon',
  'golden_fawn',
  'dutch_two_tone',
  'midnight_black',
];

export class SceneController {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;

  public bunnies: BunnyModel[] = [];
  public selectedBunnyId: string = '';
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
  public onBunniesUpdate?: (bunnies: BunnyData[], selectedId: string) => void;
  public happiness: number = 90;
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
    this.camera.position.set(0, 2.4, 4.6);

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
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0.6, 0);

    // 5. Lighting Rig
    this.lighting = new LightingRig(this.scene);
    this.scene.add(this.lighting.group);

    // 6. Meadow Environment
    this.meadow = new MeadowEnvironment();
    this.scene.add(this.meadow.group);

    // 7. Initialize Initial Bunny Fluffle (3 adorable companions)
    this.initFluffle();

    // Attach interaction handlers
    this.bindEvents();

    // Start render loop
    this.animate();
  }

  // Convenient getter for backwards compatibility
  public get bunny(): BunnyModel {
    return this.getSelectedBunny() || this.bunnies[0];
  }

  public get selectedBunny(): BunnyModel {
    return this.getSelectedBunny();
  }

  public getBunniesData(): BunnyData[] {
    return this.bunnies.map((b) => b.getData());
  }

  private initFluffle() {
    // 1. Bramble: Holland Lop (Adult) at center
    const b1 = this.createBunnyInstance('bramble', 'Bramble', 'holland_lop', false, 0, 0, 0);

    // 2. Snowdrop: Cotton White Kit (Baby) slightly to the left
    const b2 = this.createBunnyInstance('snowdrop', 'Snowdrop', 'cotton_white', true, -1.2, 0.4, 0.35);

    // 3. Hazel: Cinnamon Copper (Adult) to the right
    const b3 = this.createBunnyInstance('hazel', 'Hazel', 'cinnamon', false, 1.3, -0.3, -0.4);

    this.bunnies = [b1, b2, b3];
    this.selectBunny(b1.id);
  }

  private createBunnyInstance(
    id: string,
    name: string,
    breed: BunnyBreed,
    isBaby: boolean,
    posX: number,
    posZ: number,
    rotY: number
  ): BunnyModel {
    const bunny = new BunnyModel(id, name, breed, isBaby);
    bunny.group.position.set(posX, 0, posZ);
    bunny.group.rotation.y = rotY;
    this.scene.add(bunny.group);
    return bunny;
  }

  public addBunny(breed?: BunnyBreed, isBaby?: boolean, customName?: string): BunnyModel {
    if (this.bunnies.length >= 10) {
      return this.getSelectedBunny();
    }

    const index = this.bunnies.length;
    const name = customName || BUNNY_NAMES[index % BUNNY_NAMES.length];
    const assignedBreed = breed || BREED_ROTATION[index % BREED_ROTATION.length];
    const assignedBaby = isBaby !== undefined ? isBaby : Math.random() < 0.4;

    const angle = (index / 6) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 1.2 + Math.random() * 1.5;
    const posX = Math.cos(angle) * dist;
    const posZ = Math.sin(angle) * dist;

    const newBunny = this.createBunnyInstance(
      `bunny_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      assignedBreed,
      assignedBaby,
      posX,
      posZ,
      -angle
    );

    this.bunnies.push(newBunny);
    this.selectBunny(newBunny.id);
    soundFx.playPopSound();

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ff9ff3', '#feca57', '#54a0ff'],
    });

    this.syncState();
    return newBunny;
  }

  public removeBunny(id: string) {
    if (this.bunnies.length <= 1) return; // Keep at least one bunny

    const index = this.bunnies.findIndex((b) => b.id === id);
    if (index !== -1) {
      const b = this.bunnies[index];
      this.scene.remove(b.group);
      this.bunnies.splice(index, 1);

      if (this.selectedBunnyId === id) {
        this.selectBunny(this.bunnies[0].id);
      } else {
        this.syncState();
      }
    }
  }

  public selectBunny(id: string) {
    this.selectedBunnyId = id;
    this.bunnies.forEach((b) => {
      b.setSelected(b.id === id);
    });
    this.syncState();
  }

  public getSelectedBunny(): BunnyModel {
    return this.bunnies.find((b) => b.id === this.selectedBunnyId) || this.bunnies[0];
  }

  private syncState() {
    const list = this.bunnies.map((b) => b.getData());
    const totalHappiness = Math.round(
      this.bunnies.reduce((sum, b) => sum + b.happiness, 0) / Math.max(1, this.bunnies.length)
    );
    const totalCarrots = this.bunnies.reduce((sum, b) => sum + b.carrotsEaten, 0);

    this.happiness = totalHappiness;
    this.carrotsEaten = totalCarrots;

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.happiness, this.carrotsEaten);
    }
    if (this.onBunniesUpdate) {
      this.onBunniesUpdate(list, this.selectedBunnyId);
    }
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

    // Raycast to find 3D point for bunnies to look at
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.meadow.terrainMesh);
    if (intersects.length > 0) {
      const pt = intersects[0].point;
      this.bunnies.forEach((b) => {
        b.lookAtTarget.copy(pt);
      });
    }
  }

  private onCanvasClick(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check if clicked directly on any bunny
    for (const b of this.bunnies) {
      const hits = this.raycaster.intersectObjects(b.group.children, true);
      if (hits.length > 0) {
        this.selectBunny(b.id);
        this.petBunny(b);
        return;
      }
    }

    // 2. Check if clicked on terrain to spawn carrot
    const terrainHits = this.raycaster.intersectObject(this.meadow.terrainMesh);
    if (terrainHits.length > 0) {
      const p = terrainHits[0].point;
      this.dropCarrot(p.x, p.z);
    }
  }

  public dropCarrot(x: number, z: number) {
    const carrot = this.meadow.spawnCarrot(x, z);
    soundFx.playHappyChime();

    // Find the closest non-eating bunny to this carrot
    let nearestBunny: BunnyModel | null = null;
    let minDist = Infinity;

    for (const b of this.bunnies) {
      if (b.isSleeping) continue;
      const d = Math.hypot(b.group.position.x - x, b.group.position.z - z);
      if (d < minDist) {
        minDist = d;
        nearestBunny = b;
      }
    }

    // If all sleeping or busy, wake/use selected bunny
    if (!nearestBunny) {
      nearestBunny = this.getSelectedBunny();
      nearestBunny.setSleeping(false);
    }

    const targetBunny = nearestBunny;

    // Bunny hops toward carrot to eat it
    const destX = x + (targetBunny.group.position.x > x ? 0.25 : -0.25);
    const destZ = z + (targetBunny.group.position.z > z ? 0.25 : -0.25);

    targetBunny.hopTo(destX, destZ, () => {
      // Reached carrot
      targetBunny.triggerEat();
      soundFx.playCrunchSound();

      setTimeout(() => {
        soundFx.playCrunchSound();
      }, 400);

      setTimeout(() => {
        targetBunny.stopEat();
        this.meadow.removeCarrot(carrot);
        targetBunny.triggerEarWiggle();

        targetBunny.carrotsEaten += 1;
        targetBunny.happiness = Math.min(100, targetBunny.happiness + 6);
        this.syncState();

        // Trigger celebratory confetti
        confetti({
          particleCount: 22,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#ff9f43', '#10ac84', '#feca57'],
        });
      }, 1200);
    });
  }

  public feedFeast() {
    // Drop a carrot for EVERY bunny in the fluffle!
    soundFx.playHappyChime();
    this.bunnies.forEach((b, idx) => {
      const angle = (idx / this.bunnies.length) * Math.PI * 2;
      const dist = 1.0 + Math.random() * 0.8;
      const cx = b.group.position.x + Math.cos(angle) * dist;
      const cz = b.group.position.z + Math.sin(angle) * dist;

      setTimeout(() => {
        const carrot = this.meadow.spawnCarrot(cx, cz);
        b.setSleeping(false);
        b.hopTo(cx * 0.9, cz * 0.9, () => {
          b.triggerEat();
          soundFx.playCrunchSound();
          setTimeout(() => {
            b.stopEat();
            this.meadow.removeCarrot(carrot);
            b.triggerEarWiggle();
            b.carrotsEaten += 1;
            b.happiness = Math.min(100, b.happiness + 8);
            this.syncState();
          }, 1200);
        });
      }, idx * 150);
    });

    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#ff9f43', '#ff6b6b', '#10ac84', '#feca57'],
    });
  }

  public whistleAll() {
    soundFx.playWhistleSound();

    // All bunnies wake up, wiggle ears and hop towards the center/camera in an adorable circle!
    this.bunnies.forEach((b, i) => {
      b.setSleeping(false);
      b.triggerEarWiggle();

      setTimeout(() => {
        const angle = (i / this.bunnies.length) * Math.PI * 2 + Math.PI / 2;
        const rad = 1.0 + (b.isBaby ? 0.3 : 0.6);
        const tx = Math.cos(angle) * rad;
        const tz = Math.sin(angle) * rad;
        b.hopTo(tx, tz);
      }, 180 + i * 100);
    });

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.65 },
      colors: ['#54a0ff', '#5f27cd', '#ff9ff3'],
    });
  }

  public petBunny(targetBunny?: BunnyModel) {
    const b = targetBunny || this.getSelectedBunny();
    b.pet();
    soundFx.playHappyChime();
    this.syncState();

    confetti({
      particleCount: 16,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#ff6b6b', '#feca57', '#ff9ff3'],
    });
  }

  public triggerHop() {
    const b = this.getSelectedBunny();
    const angle = Math.random() * Math.PI * 2;
    const distance = 0.8 + Math.random() * 0.8;
    const targetX = Math.max(-3.2, Math.min(3.2, b.group.position.x + Math.cos(angle) * distance));
    const targetZ = Math.max(-3.2, Math.min(3.2, b.group.position.z + Math.sin(angle) * distance));

    soundFx.playHopSound();
    b.hopTo(targetX, targetZ);
  }

  public hopAll() {
    soundFx.playHopSound();
    this.bunnies.forEach((b, idx) => {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 0.7 + Math.random() * 0.8;
        const tx = Math.max(-3.2, Math.min(3.2, b.group.position.x + Math.cos(angle) * distance));
        const tz = Math.max(-3.2, Math.min(3.2, b.group.position.z + Math.sin(angle) * distance));
        b.hopTo(tx, tz);
      }, idx * 120);
    });
  }

  public toggleSleep() {
    // Toggle sleep for selected bunny or all
    const b = this.getSelectedBunny();
    const next = !b.isSleeping;
    b.setSleeping(next);
    this.syncState();
    return next;
  }

  public toggleSleepAll(forceSleep?: boolean) {
    const anyAwake = this.bunnies.some((b) => !b.isSleeping);
    const next = forceSleep !== undefined ? forceSleep : anyAwake;
    this.bunnies.forEach((b) => b.setSleeping(next));
    this.syncState();
    return next;
  }

  public setBreed(breed: BunnyBreed) {
    const b = this.getSelectedBunny();
    b.setBreed(breed);
    this.syncState();
  }

  public setBaby(isBaby: boolean) {
    const b = this.getSelectedBunny();
    b.setBaby(isBaby);
    this.syncState();
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
    const focusTarget = this.getSelectedBunny().group.position.clone();
    focusTarget.y += 0.5;

    switch (preset) {
      case 'portrait':
        this.targetCameraPos = new THREE.Vector3(focusTarget.x, focusTarget.y + 0.4, focusTarget.z + 1.8);
        this.targetLookAt = focusTarget;
        break;
      case 'cinematic':
        this.targetCameraPos = new THREE.Vector3(3.4, 2.5, 4.2);
        this.targetLookAt = new THREE.Vector3(0, 0.6, 0);
        break;
      case 'macro':
        this.targetCameraPos = new THREE.Vector3(focusTarget.x - 0.5, focusTarget.y - 0.1, focusTarget.z + 1.1);
        this.targetLookAt = focusTarget;
        break;
      case 'birds_eye':
        this.targetCameraPos = new THREE.Vector3(0, 8.0, 4.5);
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

    // Update all bunnies in the fluffle
    const bounds = { minX: -3.8, maxX: 3.8, minZ: -3.8, maxZ: 3.8 };
    for (const b of this.bunnies) {
      b.update(delta, bounds);
    }

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
