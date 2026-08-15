import * as THREE from 'three';
import { BunnyBreed, BunnyData } from '../types';

export interface BunnyMaterials {
  fur: THREE.MeshStandardMaterial;
  furSecondary: THREE.MeshStandardMaterial;
  innerEar: THREE.MeshStandardMaterial;
  nose: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial;
  eyeHighlight: THREE.MeshBasicMaterial;
  claw: THREE.MeshStandardMaterial;
  whisker: THREE.LineBasicMaterial;
}

export class BunnyModel {
  public id: string;
  public name: string;
  public group: THREE.Group;
  public headGroup: THREE.Group;
  public bodyGroup: THREE.Group;
  public leftEarGroup: THREE.Group;
  public rightEarGroup: THREE.Group;
  public noseMesh: THREE.Mesh;
  public tailMesh: THREE.Mesh;
  public leftFrontLeg: THREE.Group;
  public rightFrontLeg: THREE.Group;
  public leftHindLeg: THREE.Group;
  public rightHindLeg: THREE.Group;
  public selectionRing: THREE.Mesh | null = null;

  private materials: BunnyMaterials;
  private breed: BunnyBreed = 'cotton_white';
  public isBaby: boolean = false;
  public scaleFactor: number = 1.0;
  public happiness: number = 85;
  public carrotsEaten: number = 0;
  public isSelected: boolean = false;

  // Animation states
  public isHopping: boolean = false;
  public isSleeping: boolean = false;
  public isEating: boolean = false;
  public earWiggle: boolean = false;
  public lookAtTarget: THREE.Vector3 = new THREE.Vector3(0, 0.5, 5);

  private hopProgress: number = 0;
  private hopStartPos: THREE.Vector3 = new THREE.Vector3();
  private hopTargetPos: THREE.Vector3 = new THREE.Vector3();
  private hopDuration: number = 0.55;
  private hopTimer: number = 0;
  private onHopComplete?: () => void;

  private breathTimer: number = 0;
  private noseTwitchTimer: number = 0;
  private earTwitchTimer: number = 0;
  private earTwitchActive: number = 0;
  private chewTimer: number = 0;

  // Autonomous wandering behavior
  private wanderTimer: number = 0;
  private wanderInterval: number = 4 + Math.random() * 6;

  constructor(
    id: string = 'bunny_' + Math.random().toString(36).substring(2, 9),
    name: string = 'Snowdrop',
    breed: BunnyBreed = 'cotton_white',
    isBaby: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.breed = breed;
    this.isBaby = isBaby;
    this.scaleFactor = isBaby ? 0.65 : 1.0;

    this.group = new THREE.Group();
    this.group.name = `Bunny_${id}`;

    // Materials setup
    this.materials = this.createMaterials(this.breed);

    // Hierarchy creation
    this.bodyGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.leftEarGroup = new THREE.Group();
    this.rightEarGroup = new THREE.Group();
    this.leftFrontLeg = new THREE.Group();
    this.rightFrontLeg = new THREE.Group();
    this.leftHindLeg = new THREE.Group();
    this.rightHindLeg = new THREE.Group();

    this.buildBunny();
    this.buildSelectionRing();
    this.setBreed(breed);
    this.setBaby(isBaby);
  }

  private createMaterials(breed: BunnyBreed): BunnyMaterials {
    const colors = this.getBreedColors(breed);

    const fur = new THREE.MeshStandardMaterial({
      color: colors.primary,
      roughness: 0.85,
      metalness: 0.05,
      bumpScale: 0.03,
    });

    const furSecondary = new THREE.MeshStandardMaterial({
      color: colors.secondary,
      roughness: 0.88,
      metalness: 0.02,
    });

    const innerEar = new THREE.MeshStandardMaterial({
      color: colors.innerEar,
      roughness: 0.6,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const nose = new THREE.MeshStandardMaterial({
      color: colors.nose,
      roughness: 0.4,
      metalness: 0.1,
    });

    const eye = new THREE.MeshStandardMaterial({
      color: colors.eye,
      roughness: 0.1,
      metalness: 0.8,
    });

    const eyeHighlight = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const claw = new THREE.MeshStandardMaterial({
      color: 0xe0d6cc,
      roughness: 0.5,
    });

    const whisker = new THREE.LineBasicMaterial({
      color: colors.whisker,
      linewidth: 1,
      transparent: true,
      opacity: 0.7,
    });

    return { fur, furSecondary, innerEar, nose, eye, eyeHighlight, claw, whisker };
  }

  private getBreedColors(breed: BunnyBreed) {
    switch (breed) {
      case 'holland_lop':
        return {
          primary: 0xd8b58a, // Warm butterscotch fawn
          secondary: 0xf5eedb, // Creamy belly
          innerEar: 0xe89b88,
          nose: 0xda7b7b,
          eye: 0x3d200f,
          whisker: 0x333333,
        };
      case 'dutch_two_tone':
        return {
          primary: 0x222224, // Dark chocolate / black saddle
          secondary: 0xfefefe, // Pure white blaze and chest
          innerEar: 0xd98282,
          nose: 0xcc6e6e,
          eye: 0x1f140e,
          whisker: 0xdddddd,
        };
      case 'cinnamon':
        return {
          primary: 0xad582a, // Rich copper cinnamon
          secondary: 0xd68d5e, // Warm peach
          innerEar: 0xe6857c,
          nose: 0xbf5858,
          eye: 0x471d0d,
          whisker: 0x2e1b11,
        };
      case 'midnight_black':
        return {
          primary: 0x1a1a1d, // Sleek obsidian
          secondary: 0x2a2a30,
          innerEar: 0x5a3e42,
          nose: 0x3a2e32,
          eye: 0x111111,
          whisker: 0x888888,
        };
      case 'golden_fawn':
        return {
          primary: 0xe5a65d, // Golden amber
          secondary: 0xfff3db,
          innerEar: 0xf29b9b,
          nose: 0xe27b7b,
          eye: 0x381e05,
          whisker: 0x555555,
        };
      case 'cotton_white':
      default:
        return {
          primary: 0xfbfbfb, // Snow white
          secondary: 0xf0f0f5,
          innerEar: 0xf7a8b8, // Soft rose pink
          nose: 0xfa889f,
          eye: 0x8c2838, // Ruby albino / soft dark gem
          whisker: 0xcccccc,
        };
    }
  }

  public getBaseEarRotation(isLeft: boolean): THREE.Euler {
    const side = isLeft ? -1 : 1;
    if (this.breed === 'holland_lop') {
      // Lop ears flop naturally downwards along the sides of the head/cheeks
      return new THREE.Euler(0.14, side * -0.25, side * -1.45);
    }
    // Upright breeds: tall erect ears, angled back (-0.22 rad) and outwards
    return new THREE.Euler(-0.22, side * 0.18, side * 0.16);
  }

  public setBreed(breed: BunnyBreed) {
    this.breed = breed;
    const colors = this.getBreedColors(breed);

    this.materials.fur.color.setHex(colors.primary);
    this.materials.furSecondary.color.setHex(colors.secondary);
    this.materials.innerEar.color.setHex(colors.innerEar);
    this.materials.nose.color.setHex(colors.nose);
    this.materials.eye.color.setHex(colors.eye);
    this.materials.whisker.color.setHex(colors.whisker);

    // Apply base posture instantly
    const leftRot = this.getBaseEarRotation(true);
    const rightRot = this.getBaseEarRotation(false);
    this.leftEarGroup.rotation.copy(leftRot);
    this.rightEarGroup.rotation.copy(rightRot);
  }

  private buildBunny() {
    const castShadow = true;
    const receiveShadow = true;

    // --- MAIN BODY ---
    // Body is an egg-shaped sphere slightly flattened and tilted
    const bodyGeo = new THREE.SphereGeometry(0.55, 32, 24);
    bodyGeo.scale(1.0, 1.15, 1.35);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.fur);
    bodyMesh.castShadow = castShadow;
    bodyMesh.receiveShadow = receiveShadow;
    bodyMesh.position.set(0, 0.52, 0);
    bodyMesh.rotation.x = -0.22;
    this.bodyGroup.add(bodyMesh);

    // Fluffy chest ruff (secondary fur)
    const chestGeo = new THREE.SphereGeometry(0.42, 24, 18);
    chestGeo.scale(0.9, 0.95, 1.0);
    const chestMesh = new THREE.Mesh(chestGeo, this.materials.furSecondary);
    chestMesh.position.set(0, 0.58, 0.36);
    chestMesh.rotation.x = -0.3;
    chestMesh.castShadow = castShadow;
    this.bodyGroup.add(chestMesh);

    // Fluffy Cotton Tail
    const tailGeo = new THREE.SphereGeometry(0.18, 20, 16);
    tailGeo.scale(1.0, 1.1, 1.1);
    this.tailMesh = new THREE.Mesh(tailGeo, this.materials.furSecondary);
    this.tailMesh.position.set(0, 0.5, -0.65);
    this.tailMesh.castShadow = castShadow;
    this.bodyGroup.add(this.tailMesh);

    // --- LEGS & PAWS ---
    // Hind Legs (large, tucked in sitting posture)
    const createHindLeg = (side: number) => {
      const legGroup = new THREE.Group();
      // Thigh
      const thighGeo = new THREE.SphereGeometry(0.32, 20, 16);
      thighGeo.scale(0.65, 1.2, 1.1);
      const thighMesh = new THREE.Mesh(thighGeo, this.materials.fur);
      thighMesh.rotation.x = 0.35;
      thighMesh.rotation.z = side * 0.2;
      thighMesh.castShadow = castShadow;
      legGroup.add(thighMesh);

      // Foot paw
      const footGeo = new THREE.CapsuleGeometry(0.12, 0.32, 12, 16);
      const footMesh = new THREE.Mesh(footGeo, this.materials.furSecondary);
      footMesh.rotation.x = Math.PI / 2;
      footMesh.position.set(0, -0.28, 0.18);
      footMesh.castShadow = castShadow;
      footMesh.receiveShadow = receiveShadow;
      legGroup.add(footMesh);

      legGroup.position.set(side * 0.42, 0.32, -0.15);
      return legGroup;
    };

    this.leftHindLeg = createHindLeg(-1);
    this.rightHindLeg = createHindLeg(1);
    this.bodyGroup.add(this.leftHindLeg);
    this.bodyGroup.add(this.rightHindLeg);

    // Front Legs
    const createFrontLeg = (side: number) => {
      const legGroup = new THREE.Group();
      const armGeo = new THREE.CapsuleGeometry(0.09, 0.32, 12, 16);
      const armMesh = new THREE.Mesh(armGeo, this.materials.fur);
      armMesh.position.set(0, -0.14, 0);
      armMesh.rotation.x = 0.15;
      armMesh.castShadow = castShadow;
      legGroup.add(armMesh);

      // Front Paw
      const pawGeo = new THREE.SphereGeometry(0.11, 14, 12);
      pawGeo.scale(0.9, 0.7, 1.2);
      const pawMesh = new THREE.Mesh(pawGeo, this.materials.furSecondary);
      pawMesh.position.set(0, -0.32, 0.08);
      pawMesh.castShadow = castShadow;
      legGroup.add(pawMesh);

      legGroup.position.set(side * 0.22, 0.35, 0.38);
      return legGroup;
    };

    this.leftFrontLeg = createFrontLeg(-1);
    this.rightFrontLeg = createFrontLeg(1);
    this.bodyGroup.add(this.leftFrontLeg);
    this.bodyGroup.add(this.rightFrontLeg);

    // --- HEAD HIERARCHY ---
    this.headGroup.position.set(0, 0.95, 0.42);

    // Head Skull
    const headGeo = new THREE.SphereGeometry(0.38, 28, 22);
    headGeo.scale(1.0, 0.95, 1.1);
    const headMesh = new THREE.Mesh(headGeo, this.materials.fur);
    headMesh.castShadow = castShadow;
    headMesh.receiveShadow = receiveShadow;
    this.headGroup.add(headMesh);

    // Cheeks & Snout
    const muzzleGeo = new THREE.SphereGeometry(0.24, 20, 16);
    muzzleGeo.scale(1.05, 0.8, 1.0);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, this.materials.furSecondary);
    muzzleMesh.position.set(0, -0.1, 0.26);
    muzzleMesh.castShadow = castShadow;
    this.headGroup.add(muzzleMesh);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.065, 16, 12);
    noseGeo.scale(1.2, 0.8, 0.9);
    this.noseMesh = new THREE.Mesh(noseGeo, this.materials.nose);
    this.noseMesh.position.set(0, -0.06, 0.46);
    this.headGroup.add(this.noseMesh);

    // Eyes
    const createEye = (side: number) => {
      const eyeGroup = new THREE.Group();
      const eyeGeo = new THREE.SphereGeometry(0.08, 20, 16);
      const eyeMesh = new THREE.Mesh(eyeGeo, this.materials.eye);
      eyeMesh.scale.set(0.9, 1.1, 1.0);
      eyeGroup.add(eyeMesh);

      // Specular Reflection glint
      const glintGeo = new THREE.SphereGeometry(0.024, 10, 8);
      const glintMesh = new THREE.Mesh(glintGeo, this.materials.eyeHighlight);
      glintMesh.position.set(0.03, 0.03, 0.06);
      eyeGroup.add(glintMesh);

      // Secondary smaller reflection glint
      const glint2Geo = new THREE.SphereGeometry(0.012, 8, 6);
      const glint2Mesh = new THREE.Mesh(glint2Geo, this.materials.eyeHighlight);
      glint2Mesh.position.set(-0.02, -0.02, 0.065);
      eyeGroup.add(glint2Mesh);

      eyeGroup.position.set(side * 0.28, 0.06, 0.22);
      eyeGroup.rotation.y = side * 0.6;
      return eyeGroup;
    };

    const leftEye = createEye(-1);
    const rightEye = createEye(1);
    this.headGroup.add(leftEye);
    this.headGroup.add(rightEye);

    // Whiskers
    const createWhiskers = (side: number) => {
      const whiskerGroup = new THREE.Group();
      const whiskerOffsets = [
        [-0.02, 0.02, 0.25],
        [0.0, 0.0, 0.28],
        [0.02, -0.02, 0.25],
      ];

      whiskerOffsets.forEach(([dy, dz, len]) => {
        const points = [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * len * 0.5, dy * 0.5, dz * 0.3),
          new THREE.Vector3(side * len, dy - 0.03, dz * 0.4),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(8));
        const line = new THREE.Line(geo, this.materials.whisker);
        whiskerGroup.add(line);
      });

      whiskerGroup.position.set(side * 0.16, -0.08, 0.38);
      return whiskerGroup;
    };

    this.headGroup.add(createWhiskers(-1));
    this.headGroup.add(createWhiskers(1));

    // --- EARS ---
    const createEar = (side: number) => {
      const isLeft = side < 0;
      const earGroup = new THREE.Group();
      earGroup.name = isLeft ? 'LeftEar' : 'RightEar';

      // 1. Soft fur base collar/socket transitioning smoothly into skull
      const socketGeo = new THREE.SphereGeometry(0.075, 16, 12);
      socketGeo.scale(0.85, 0.6, 0.85);
      const socketMesh = new THREE.Mesh(socketGeo, this.materials.fur);
      socketMesh.position.set(0, 0.02, 0);
      socketMesh.castShadow = castShadow;
      socketMesh.receiveShadow = receiveShadow;
      earGroup.add(socketMesh);

      // 2. Outer Ear (Realistic curved 3D leaf/spoon pinna geometry)
      const outerEarGeo = this.createOuterEarGeometry(side);
      const outerEarMesh = new THREE.Mesh(outerEarGeo, this.materials.fur);
      outerEarMesh.castShadow = castShadow;
      outerEarMesh.receiveShadow = receiveShadow;
      earGroup.add(outerEarMesh);

      // 3. Inner Ear (Concave rosy velvet inner channel)
      const innerEarGeo = this.createInnerEarGeometry(side);
      const innerEarMesh = new THREE.Mesh(innerEarGeo, this.materials.innerEar);
      innerEarMesh.castShadow = castShadow;
      earGroup.add(innerEarMesh);

      // Position ear root at top-rear crown of head skull
      earGroup.position.set(side * 0.16, 0.32, -0.06);
      return earGroup;
    };

    this.leftEarGroup = createEar(-1);
    this.rightEarGroup = createEar(1);
    this.headGroup.add(this.leftEarGroup);
    this.headGroup.add(this.rightEarGroup);

    // Assemble all into root
    this.group.add(this.bodyGroup);
    this.group.add(this.headGroup);

    // Initial position
    this.group.position.set(0, 0, 0);
  }

  private createOuterEarGeometry(side: number): THREE.BufferGeometry {
    const segmentsV = 28;
    const segmentsU = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const earHeight = 0.78;
    const maxHalfWidth = 0.125;
    const baseRadius = 0.045;

    for (let iv = 0; iv <= segmentsV; iv++) {
      const v = iv / segmentsV;
      const y = v * earHeight;

      // Realistic spoon/leaf contour: narrow root, wide middle, tapered rounded apex
      const envelope = Math.pow(Math.sin(Math.pow(v, 0.72) * Math.PI), 0.78);
      const curHalfWidth = Math.max(0.006, (1 - v * 0.96) * baseRadius + envelope * maxHalfWidth);

      // Anatomical backward curve and slight outward flare
      const zCurvature = -Math.pow(v, 1.55) * 0.10;
      const xCurvature = side * Math.pow(v, 1.35) * 0.03;

      for (let iu = 0; iu <= segmentsU; iu++) {
        const u = iu / segmentsU;
        const theta = u * Math.PI * 2; // Angle around the ear perimeter tube

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const x = cosT * curHalfWidth + xCurvature;

        let z: number;
        if (sinT >= 0) {
          // Front cavity (concave concha / pinna channel)
          const cupDepth = -sinT * 0.038 * (0.25 + 0.75 * envelope);
          z = zCurvature + cupDepth + 0.008;
        } else {
          // Rear convex shell (fur-covered dorsal surface)
          const dome = Math.abs(sinT) * 0.06 * (0.35 + 0.65 * envelope);
          z = zCurvature - dome;
        }

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < segmentsV; iv++) {
      for (let iu = 0; iu < segmentsU; iu++) {
        const a = iv * (segmentsU + 1) + iu;
        const b = (iv + 1) * (segmentsU + 1) + iu;
        const c = (iv + 1) * (segmentsU + 1) + (iu + 1);
        const d = iv * (segmentsU + 1) + (iu + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  private createInnerEarGeometry(side: number): THREE.BufferGeometry {
    const segmentsV = 24;
    const segmentsU = 16;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const earHeight = 0.68;
    const maxHalfWidth = 0.092;

    for (let iv = 0; iv <= segmentsV; iv++) {
      const v = iv / segmentsV;
      // Start slightly above base and end before the outer ear tip
      const y = 0.04 + v * earHeight;

      const envelope = Math.pow(Math.sin(Math.pow(v, 0.7) * Math.PI), 0.82);
      const curHalfWidth = Math.max(0.004, envelope * maxHalfWidth);

      const zCurvature = -Math.pow(v, 1.55) * 0.09;
      const xCurvature = side * Math.pow(v, 1.35) * 0.026;

      for (let iu = 0; iu <= segmentsU; iu++) {
        const u = iu / segmentsU;
        const angle = (u - 0.5) * Math.PI * 0.85; // Inside front concave channel

        const x = Math.sin(angle) * curHalfWidth + xCurvature;
        // Nestled just slightly inside the front concave surface
        const z = zCurvature - Math.cos(angle) * 0.022 * (0.2 + 0.8 * envelope) + 0.012;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < segmentsV; iv++) {
      for (let iu = 0; iu < segmentsU; iu++) {
        const a = iv * (segmentsU + 1) + iu;
        const b = (iv + 1) * (segmentsU + 1) + iu;
        const c = (iv + 1) * (segmentsU + 1) + (iu + 1);
        const d = iv * (segmentsU + 1) + (iu + 1);

        indices.push(a, d, b);
        indices.push(d, c, b);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  public getBreed(): BunnyBreed {
    return this.breed;
  }

  public setBaby(isBaby: boolean) {
    this.isBaby = isBaby;
    this.scaleFactor = isBaby ? 0.62 : 1.0;
    this.group.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);

    // Baby bunnies have slightly bigger heads relative to their bodies for cute kitten/kit proportions
    if (isBaby) {
      this.headGroup.scale.set(1.18, 1.18, 1.18);
    } else {
      this.headGroup.scale.set(1.0, 1.0, 1.0);
    }
  }

  public setSelected(selected: boolean) {
    this.isSelected = selected;
    if (this.selectionRing) {
      this.selectionRing.visible = selected;
    }
  }

  public pet() {
    this.triggerEarWiggle();
    this.happiness = Math.min(100, this.happiness + 4);
  }

  public getData(): BunnyData {
    return {
      id: this.id,
      name: this.name,
      breed: this.breed,
      isBaby: this.isBaby,
      scale: this.scaleFactor,
      happiness: this.happiness,
      carrotsEaten: this.carrotsEaten,
      isSleeping: this.isSleeping,
      isEating: this.isEating,
      isHopping: this.isHopping,
      position: {
        x: this.group.position.x,
        y: this.group.position.y,
        z: this.group.position.z,
      },
    };
  }

  private buildSelectionRing() {
    // Soft glowing circle on ground beneath selected bunny
    const ringGeo = new THREE.RingGeometry(0.65, 0.78, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffa834,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
    this.selectionRing.position.set(0, 0.03, 0);
    this.selectionRing.visible = false;
    this.group.add(this.selectionRing);
  }

  public hopTo(targetX: number, targetZ: number, onComplete?: () => void) {
    if (this.isHopping) return;
    this.isHopping = true;
    this.isSleeping = false;
    this.hopProgress = 0;
    this.hopTimer = 0;
    this.hopStartPos.copy(this.group.position);
    this.hopTargetPos.set(targetX, 0, targetZ);
    this.onHopComplete = onComplete;

    // Face the target direction smoothly
    const dx = targetX - this.group.position.x;
    const dz = targetZ - this.group.position.z;
    const targetAngle = Math.atan2(dx, dz);
    this.group.rotation.y = targetAngle;
  }

  public triggerEarWiggle() {
    this.earTwitchActive = 1.0;
  }

  public triggerEat() {
    this.isEating = true;
    this.chewTimer = 0;
  }

  public stopEat() {
    this.isEating = false;
  }

  public setSleeping(sleeping: boolean) {
    this.isSleeping = sleeping;
  }

  public update(delta: number, bounds?: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    this.breathTimer += delta * 2.5;
    this.noseTwitchTimer += delta * 12.0;
    this.earTwitchTimer += delta;

    // 0. Autonomous Wander (if not sleeping, eating, or currently hopping)
    if (!this.isHopping && !this.isSleeping && !this.isEating) {
      this.wanderTimer += delta;
      if (this.wanderTimer > this.wanderInterval) {
        this.wanderTimer = 0;
        this.wanderInterval = 5 + Math.random() * 8;

        // 60% chance to take a casual wander hop
        if (Math.random() < 0.65) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.5 + Math.random() * 0.9;
          const bMinX = bounds?.minX ?? -3.8;
          const bMaxX = bounds?.maxX ?? 3.8;
          const bMinZ = bounds?.minZ ?? -3.8;
          const bMaxZ = bounds?.maxZ ?? 3.8;

          let targetX = this.group.position.x + Math.cos(angle) * dist;
          let targetZ = this.group.position.z + Math.sin(angle) * dist;

          // Stay within meadow bounds & avoid deep pond area (x > 3 && z > 3)
          targetX = Math.max(bMinX, Math.min(bMaxX, targetX));
          targetZ = Math.max(bMinZ, Math.min(bMaxZ, targetZ));

          if (targetX > 2.5 && targetZ > 2.5) {
            targetX -= 1.5;
            targetZ -= 1.5;
          }

          this.hopTo(targetX, targetZ);
        }
      }
    }

    // Pulse selection ring if selected
    if (this.selectionRing && this.isSelected) {
      const pulse = 0.7 + Math.sin(this.breathTimer * 2) * 0.25;
      (this.selectionRing.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    // 1. Nose twitching
    const noseTwitch = Math.sin(this.noseTwitchTimer) * 0.008;
    this.noseMesh.position.y = -0.06 + Math.max(0, noseTwitch);

    // 2. Dynamic Ear Wiggles & Realistic Micro-Twitches
    if (this.earTwitchTimer > 3.0 + Math.random() * 3.5) {
      this.earTwitchActive = 1.0;
      this.earTwitchTimer = 0;
    }

    let twitchL_Z = 0;
    let twitchL_X = 0;
    let twitchR_Z = 0;
    let twitchR_X = 0;

    if (this.earTwitchActive > 0) {
      this.earTwitchActive = Math.max(0, this.earTwitchActive - delta * 3.5);
      const intensity = Math.sin(this.earTwitchActive * Math.PI);
      const freq = Math.sin(this.earTwitchActive * Math.PI * 8);
      twitchL_Z = freq * 0.22 * intensity;
      twitchL_X = Math.cos(this.earTwitchActive * Math.PI * 8) * 0.12 * intensity;
      twitchR_Z = -freq * 0.26 * intensity;
      twitchR_X = Math.sin(this.earTwitchActive * Math.PI * 8) * 0.14 * intensity;
    }

    const baseRotL = this.getBaseEarRotation(true);
    const baseRotR = this.getBaseEarRotation(false);

    if (this.isSleeping) {
      // Slept-back relaxed posture
      const sleepRotZ = this.breed === 'holland_lop' ? -1.55 : -0.58;
      const sleepRotZR = this.breed === 'holland_lop' ? 1.55 : 0.58;
      const sleepRotX = 0.38;

      this.leftEarGroup.rotation.x += (sleepRotX - this.leftEarGroup.rotation.x) * 0.08;
      this.leftEarGroup.rotation.z += (sleepRotZ - this.leftEarGroup.rotation.z) * 0.08;
      this.rightEarGroup.rotation.x += (sleepRotX - this.rightEarGroup.rotation.x) * 0.08;
      this.rightEarGroup.rotation.z += (sleepRotZR - this.rightEarGroup.rotation.z) * 0.08;
    } else if (this.isEating) {
      // Gentle bounce while chewing
      const earNibble = Math.sin(this.chewTimer * 0.5) * 0.08;
      this.leftEarGroup.rotation.x = baseRotL.x + 0.15 + earNibble;
      this.leftEarGroup.rotation.y = baseRotL.y;
      this.leftEarGroup.rotation.z = baseRotL.z + twitchL_Z;

      this.rightEarGroup.rotation.x = baseRotR.x + 0.15 + earNibble;
      this.rightEarGroup.rotation.y = baseRotR.y;
      this.rightEarGroup.rotation.z = baseRotR.z + twitchR_Z;
    } else {
      // Active alert idle with subtle natural hearing micro-wiggles
      const idleL = Math.sin(this.breathTimer * 0.7) * 0.02;
      const idleR = Math.cos(this.breathTimer * 0.55) * 0.02;

      this.leftEarGroup.rotation.x = baseRotL.x + twitchL_X + idleL;
      this.leftEarGroup.rotation.y = baseRotL.y;
      this.leftEarGroup.rotation.z = baseRotL.z + twitchL_Z + idleL * 0.5;

      this.rightEarGroup.rotation.x = baseRotR.x + twitchR_X + idleR;
      this.rightEarGroup.rotation.y = baseRotR.y;
      this.rightEarGroup.rotation.z = baseRotR.z + twitchR_Z - idleR * 0.5;
    }

    // 3. Breathing / Idle animation
    if (!this.isHopping && !this.isSleeping) {
      const breathScale = 1 + Math.sin(this.breathTimer) * 0.025;
      this.bodyGroup.scale.set(breathScale, 1 / breathScale, breathScale);
      this.bodyGroup.position.y = Math.sin(this.breathTimer) * 0.015;

      // Subtle tail wag
      this.tailMesh.rotation.y = Math.sin(this.breathTimer * 0.8) * 0.12;

      // Head look-at cursor damped tracking
      if (this.lookAtTarget) {
        const localTarget = this.lookAtTarget.clone();
        this.group.worldToLocal(localTarget);

        const targetRotY = Math.max(-0.6, Math.min(0.6, Math.atan2(localTarget.x, localTarget.z)));
        const targetRotX = Math.max(-0.35, Math.min(0.4, -localTarget.y * 0.25));

        this.headGroup.rotation.y += (targetRotY - this.headGroup.rotation.y) * 0.08;
        this.headGroup.rotation.x += (targetRotX - this.headGroup.rotation.x) * 0.08;
      }
    }

    // 4. Eating / Nibbling Animation
    if (this.isEating) {
      this.chewTimer += delta * 14;
      const chew = Math.sin(this.chewTimer) * 0.04;
      this.headGroup.position.y = 0.95 - 0.25 + chew;
      this.headGroup.rotation.x = 0.45 + chew * 0.5;
      this.noseMesh.scale.set(1.2 + chew * 2, 0.8, 0.9);
    } else if (!this.isHopping && !this.isSleeping) {
      this.headGroup.position.y += (0.95 - this.headGroup.position.y) * 0.1;
    }

    // 5. Sleeping Mode
    if (this.isSleeping) {
      this.headGroup.position.y += (0.65 - this.headGroup.position.y) * 0.05;
      this.headGroup.rotation.x += (0.35 - this.headGroup.rotation.x) * 0.05;
      this.bodyGroup.scale.set(1.08, 0.85, 1.08);
    }

    // 6. Hop Animation (Parabolic physics leap)
    if (this.isHopping) {
      this.hopTimer += delta;
      this.hopProgress = Math.min(1, this.hopTimer / this.hopDuration);

      // Smooth movement along ground X-Z
      this.group.position.x = THREE.MathUtils.lerp(this.hopStartPos.x, this.hopTargetPos.x, this.hopProgress);
      this.group.position.z = THREE.MathUtils.lerp(this.hopStartPos.z, this.hopTargetPos.z, this.hopProgress);

      // Parabolic jump arc Y
      const jumpHeight = 0.65 * this.scaleFactor;
      const jumpY = Math.sin(this.hopProgress * Math.PI) * jumpHeight;
      this.group.position.y = jumpY;

      // Dynamic squash & stretch
      if (this.hopProgress < 0.2) {
        // Squash before takeoff
        const t = this.hopProgress / 0.2;
        this.bodyGroup.scale.set(1.15 - t * 0.15, 0.8 + t * 0.2, 1.1 - t * 0.1);
      } else if (this.hopProgress < 0.8) {
        // Stretch in mid-air
        this.bodyGroup.scale.set(0.9, 1.25, 0.9);
        this.bodyGroup.rotation.x = -0.35 + (this.hopProgress - 0.2) * 0.5;
        this.leftHindLeg.rotation.x = -0.5;
        this.rightHindLeg.rotation.x = -0.5;
      } else {
        // Squash upon landing
        const t = (this.hopProgress - 0.8) / 0.2;
        this.bodyGroup.scale.set(1.0 + (1 - t) * 0.15, 1.0 - (1 - t) * 0.2, 1.0 + (1 - t) * 0.1);
        this.bodyGroup.rotation.x = 0;
        this.leftHindLeg.rotation.x = 0;
        this.rightHindLeg.rotation.x = 0;
      }

      if (this.hopProgress >= 1) {
        this.isHopping = false;
        this.group.position.y = 0;
        this.bodyGroup.scale.set(1, 1, 1);
        if (this.onHopComplete) {
          this.onHopComplete();
          this.onHopComplete = undefined;
        }
      }
    }
  }
}
