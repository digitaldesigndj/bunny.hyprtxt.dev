import * as THREE from 'three';

export interface CarrotItem {
  mesh: THREE.Group;
  position: THREE.Vector3;
  eaten: boolean;
  spawnTime: number;
}

export class MeadowEnvironment {
  public group: THREE.Group;
  public terrainMesh: THREE.Mesh;
  public grassMesh: THREE.InstancedMesh | null = null;
  public flowersGroup: THREE.Group;
  public rocksGroup: THREE.Group;
  public pondMesh: THREE.Mesh | null = null;
  public butterflies: { group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh; speed: number; phase: number; radius: number; center: THREE.Vector3 }[] = [];
  public firefliesPoints: THREE.Points | null = null;
  public firefliesPositions: Float32Array | null = null;
  public pollenPoints: THREE.Points | null = null;
  public carrots: CarrotItem[] = [];

  private windTime: number = 0;
  private dummy: THREE.Object3D = new THREE.Object3D();
  private grassTransforms: { pos: THREE.Vector3; rotY: number; scale: number; baseRotX: number; baseRotZ: number }[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'MeadowEnvironment';

    this.flowersGroup = new THREE.Group();
    this.rocksGroup = new THREE.Group();

    this.buildTerrain();
    this.buildGrass();
    this.buildWildflowers();
    this.buildRocksAndStump();
    this.buildPond();
    this.buildButterflies();
    this.buildPollenAndFireflies();

    this.group.add(this.flowersGroup);
    this.group.add(this.rocksGroup);
  }

  private buildTerrain() {
    // Terrain with rolling elevation
    const size = 30;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle rolling hill math, flat near center for bunny
      const distFromCenter = Math.sqrt(x * x + z * z);
      let y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.35 + Math.sin(x * 0.1) * 0.2;
      if (distFromCenter < 3.5) {
        y *= (distFromCenter / 3.5) * 0.4;
      }
      // Depress pond corner
      if (x > 3 && z > 3) {
        const pondDist = Math.sqrt((x - 6) ** 2 + (z - 6) ** 2);
        if (pondDist < 4.0) {
          y -= Math.cos((pondDist / 4.0) * (Math.PI / 2)) * 0.45;
        }
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x4d8a3a, // Rich lush meadow green
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false,
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.name = 'GroundTerrain';
    this.group.add(this.terrainMesh);
  }

  private buildGrass() {
    // Instanced grass blade geometry
    const bladeGeo = new THREE.BufferGeometry();
    const width = 0.04;
    const height = 0.45;

    // Curved blade vertices (triangle strip / ribbon)
    const vertices = new Float32Array([
      -width, 0, 0,
      width, 0, 0,
      -width * 0.8, height * 0.5, 0.03,
      width * 0.8, height * 0.5, 0.03,
      0, height, 0.08,
    ]);

    const indices = [
      0, 1, 2,
      1, 3, 2,
      2, 3, 4,
    ];

    bladeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    bladeGeo.setIndex(indices);
    bladeGeo.computeVertexNormals();

    const grassCount = 3500;
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x5fa838,
      roughness: 0.8,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    this.grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, grassCount);
    this.grassMesh.castShadow = true;
    this.grassMesh.receiveShadow = true;

    for (let i = 0; i < grassCount; i++) {
      // Clustered distribution around the meadow
      const radius = 0.6 + Math.sqrt(Math.random()) * 11.5;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Don't spawn deep inside pond
      if (x > 3.5 && z > 3.5) continue;

      const y = this.getTerrainHeight(x, z);
      const rotY = Math.random() * Math.PI * 2;
      const scale = 0.7 + Math.random() * 0.6;
      const baseRotX = (Math.random() - 0.5) * 0.2;
      const baseRotZ = (Math.random() - 0.5) * 0.2;

      this.grassTransforms.push({
        pos: new THREE.Vector3(x, y, z),
        rotY,
        scale,
        baseRotX,
        baseRotZ,
      });

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(baseRotX, rotY, baseRotZ);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();

      this.grassMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.grassMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.grassMesh);
  }

  private buildWildflowers() {
    const flowerColors = [
      0xffffff, // Daisy white
      0xffd13b, // Buttercup yellow
      0x9b5de5, // Lavender purple
      0xf15bb5, // Wild pink
      0xe63946, // Poppy red
      0x48cae4, // Forget-me-not blue
    ];

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d7a28, roughness: 0.8 });
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5 });

    for (let i = 0; i < 90; i++) {
      const radius = 1.0 + Math.sqrt(Math.random()) * 10;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      if (x > 3.8 && z > 3.8) continue; // Skip pond

      const y = this.getTerrainHeight(x, z);
      const flower = new THREE.Group();
      flower.position.set(x, y, z);

      // Stem
      const stemHeight = 0.25 + Math.random() * 0.25;
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.018, stemHeight, 6);
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = stemHeight / 2;
      stem.castShadow = true;
      flower.add(stem);

      // Flower Center
      const fCenter = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), centerMat);
      fCenter.position.y = stemHeight;
      fCenter.castShadow = true;
      flower.add(fCenter);

      // Petals
      const colorHex = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const petalMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6, side: THREE.DoubleSide });
      const numPetals = 5 + Math.floor(Math.random() * 3);

      for (let p = 0; p < numPetals; p++) {
        const petalGeo = new THREE.CircleGeometry(0.045, 6);
        petalGeo.scale(0.6, 1.2, 1.0);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        const pAngle = (p / numPetals) * Math.PI * 2;
        petal.position.set(Math.cos(pAngle) * 0.05, stemHeight + 0.01, Math.sin(pAngle) * 0.05);
        petal.rotation.x = Math.PI / 2 + 0.2;
        petal.rotation.y = pAngle;
        petal.castShadow = true;
        flower.add(petal);
      }

      flower.rotation.y = Math.random() * Math.PI * 2;
      flower.rotation.z = (Math.random() - 0.5) * 0.15;
      this.flowersGroup.add(flower);
    }
  }

  private buildRocksAndStump() {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x7a7978,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });

    // Scattered boulders
    const rockPositions = [
      [-3.2, -2.1, 0.8],
      [4.1, -1.8, 1.1],
      [-2.0, 3.8, 0.6],
      [1.8, -4.2, 0.7],
      [-4.5, 1.5, 1.2],
      [3.0, 2.5, 0.5],
    ];

    rockPositions.forEach(([rx, rz, scale]) => {
      const rockGeo = new THREE.DodecahedronGeometry(0.4 * scale, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const ry = this.getTerrainHeight(rx, rz);
      rock.position.set(rx, ry + 0.15 * scale, rz);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.rocksGroup.add(rock);
    });

    // Old Tree Stump nearby with bark and annual rings
    const stumpGroup = new THREE.Group();
    const stumpHeight = 0.5;
    const stumpGeo = new THREE.CylinderGeometry(0.55, 0.65, stumpHeight, 14);
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.95 });
    const stumpMesh = new THREE.Mesh(stumpGeo, barkMat);
    stumpMesh.castShadow = true;
    stumpMesh.receiveShadow = true;
    stumpGroup.add(stumpMesh);

    // Stump top surface
    const topGeo = new THREE.CircleGeometry(0.54, 14);
    topGeo.rotateX(-Math.PI / 2);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xc89b67, roughness: 0.8 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = stumpHeight / 2 + 0.005;
    stumpGroup.add(topMesh);

    // Position stump on gentle hill
    const stumpX = -2.8;
    const stumpZ = -3.2;
    stumpGroup.position.set(stumpX, this.getTerrainHeight(stumpX, stumpZ) + stumpHeight / 2 - 0.05, stumpZ);
    this.rocksGroup.add(stumpGroup);
  }

  private buildPond() {
    const pondGeo = new THREE.CircleGeometry(3.2, 32);
    pondGeo.rotateX(-Math.PI / 2);

    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x227093,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    this.pondMesh = new THREE.Mesh(pondGeo, pondMat);
    this.pondMesh.position.set(5.8, -0.05, 5.8);
    this.pondMesh.receiveShadow = true;
    this.group.add(this.pondMesh);

    // Pond border pebble ring
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x57606f, roughness: 0.7, flatShading: true });
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 3.0 + Math.random() * 0.3;
      const px = 5.8 + Math.cos(angle) * dist;
      const pz = 5.8 + Math.sin(angle) * dist;
      const py = this.getTerrainHeight(px, pz);

      const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.1, 0), pebbleMat);
      pebble.position.set(px, py + 0.06, pz);
      pebble.castShadow = true;
      this.rocksGroup.add(pebble);
    }
  }

  private buildButterflies() {
    const butterflyColors = [0xffd166, 0x06d6a0, 0x118ab2, 0xef476f];

    for (let i = 0; i < 4; i++) {
      const bGroup = new THREE.Group();
      const color = butterflyColors[i % butterflyColors.length];
      const wingMat = new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: 0.4,
      });

      const wingShape = new THREE.BufferGeometry();
      const wingVerts = new Float32Array([
        0, 0, 0,
        0.12, 0.08, 0,
        0.08, -0.06, 0,
      ]);
      wingShape.setAttribute('position', new THREE.BufferAttribute(wingVerts, 3));
      wingShape.computeVertexNormals();

      const leftWing = new THREE.Mesh(wingShape, wingMat);
      const rightWing = new THREE.Mesh(wingShape, wingMat);
      rightWing.scale.x = -1;

      bGroup.add(leftWing);
      bGroup.add(rightWing);

      // Body
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.015, 0.06, 4, 8),
        new THREE.MeshBasicMaterial({ color: 0x111111 })
      );
      body.rotation.x = Math.PI / 2;
      bGroup.add(body);

      const center = new THREE.Vector3((Math.random() - 0.5) * 6, 0.8 + Math.random() * 0.8, (Math.random() - 0.5) * 6);
      bGroup.position.copy(center);

      this.butterflies.push({
        group: bGroup,
        leftWing,
        rightWing,
        speed: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        radius: 1.2 + Math.random() * 1.5,
        center,
      });

      this.group.add(bGroup);
    }
  }

  private buildPollenAndFireflies() {
    // Floating pollen motes (golden particles in sun)
    const pollenCount = 120;
    const pollenGeo = new THREE.BufferGeometry();
    const pollenPos = new Float32Array(pollenCount * 3);

    for (let i = 0; i < pollenCount * 3; i += 3) {
      pollenPos[i] = (Math.random() - 0.5) * 16;
      pollenPos[i + 1] = 0.2 + Math.random() * 3.5;
      pollenPos[i + 2] = (Math.random() - 0.5) * 16;
    }
    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3));

    const pollenMat = new THREE.PointsMaterial({
      color: 0xffe6aa,
      size: 0.07,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.pollenPoints = new THREE.Points(pollenGeo, pollenMat);
    this.group.add(this.pollenPoints);

    // Glowing Fireflies (active at twilight / night)
    const fireflyCount = 60;
    const fireflyGeo = new THREE.BufferGeometry();
    this.firefliesPositions = new Float32Array(fireflyCount * 3);

    for (let i = 0; i < fireflyCount * 3; i += 3) {
      this.firefliesPositions[i] = (Math.random() - 0.5) * 14;
      this.firefliesPositions[i + 1] = 0.3 + Math.random() * 2.0;
      this.firefliesPositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(this.firefliesPositions, 3));

    const fireflyMat = new THREE.PointsMaterial({
      color: 0x99ff66,
      size: 0.14,
      transparent: true,
      opacity: 0.0, // Managed by time-of-day
      blending: THREE.AdditiveBlending,
    });
    this.firefliesPoints = new THREE.Points(fireflyGeo, fireflyMat);
    this.group.add(this.firefliesPoints);
  }

  public getTerrainHeight(x: number, z: number): number {
    const distFromCenter = Math.sqrt(x * x + z * z);
    let y = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.35 + Math.sin(x * 0.1) * 0.2;
    if (distFromCenter < 3.5) {
      y *= (distFromCenter / 3.5) * 0.4;
    }
    if (x > 3 && z > 3) {
      const pondDist = Math.sqrt((x - 6) ** 2 + (z - 6) ** 2);
      if (pondDist < 4.0) {
        y -= Math.cos((pondDist / 4.0) * (Math.PI / 2)) * 0.45;
      }
    }
    return y;
  }

  public spawnCarrot(x: number, z: number): CarrotItem {
    const carrotGroup = new THREE.Group();
    const y = this.getTerrainHeight(x, z);

    // Carrot root cone
    const rootGeo = new THREE.ConeGeometry(0.09, 0.45, 12);
    rootGeo.rotateX(Math.PI);
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.4,
      metalness: 0.05,
    });
    const rootMesh = new THREE.Mesh(rootGeo, rootMat);
    rootMesh.position.y = 0.22;
    rootMesh.castShadow = true;
    rootMesh.receiveShadow = true;
    carrotGroup.add(rootMesh);

    // Green leafy top
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 4; i++) {
      const leafGeo = new THREE.PlaneGeometry(0.06, 0.22);
      leafGeo.rotateX(Math.PI / 2);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 4) * Math.PI * 2;
      leaf.position.set(Math.cos(angle) * 0.03, 0.46, Math.sin(angle) * 0.03);
      leaf.rotation.z = Math.PI / 6;
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      carrotGroup.add(leaf);
    }

    // Tilt carrot slightly as if dropped in grass
    carrotGroup.rotation.z = 0.35;
    carrotGroup.rotation.y = Math.random() * Math.PI * 2;
    carrotGroup.position.set(x, y, z);

    // Scale pop-in
    carrotGroup.scale.set(0.01, 0.01, 0.01);

    this.group.add(carrotGroup);

    const carrotItem: CarrotItem = {
      mesh: carrotGroup,
      position: new THREE.Vector3(x, y, z),
      eaten: false,
      spawnTime: performance.now(),
    };

    this.carrots.push(carrotItem);
    return carrotItem;
  }

  public removeCarrot(item: CarrotItem) {
    const idx = this.carrots.indexOf(item);
    if (idx !== -1) {
      this.carrots.splice(idx, 1);
      this.group.remove(item.mesh);
    }
  }

  public update(delta: number, windSpeed: number = 1.0, isNightOrTwilight: boolean = false) {
    this.windTime += delta * windSpeed * 2.2;

    // 1. Animate instanced grass blades with wind sway
    if (this.grassMesh && this.grassTransforms.length > 0) {
      for (let i = 0; i < this.grassTransforms.length; i++) {
        const item = this.grassTransforms[i];
        // Wind wave across X/Z coordinates
        const wave = Math.sin(this.windTime + item.pos.x * 0.4 + item.pos.z * 0.3) * 0.18 * windSpeed;
        const crossWave = Math.cos(this.windTime * 0.8 + item.pos.z * 0.5) * 0.1 * windSpeed;

        this.dummy.position.copy(item.pos);
        this.dummy.rotation.set(item.baseRotX + wave, item.rotY, item.baseRotZ + crossWave);
        this.dummy.scale.set(item.scale, item.scale, item.scale);
        this.dummy.updateMatrix();

        this.grassMesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.grassMesh.instanceMatrix.needsUpdate = true;
    }

    // 2. Animate Butterflies
    this.butterflies.forEach((b) => {
      b.phase += delta * b.speed;
      const angle = b.phase;
      const bx = b.center.x + Math.cos(angle) * b.radius;
      const bz = b.center.z + Math.sin(angle * 2) * (b.radius * 0.6);
      const by = b.center.y + Math.sin(angle * 3) * 0.25;

      b.group.position.set(bx, by, bz);
      b.group.rotation.y = -angle + Math.PI / 2;

      // Wing flapping
      const flap = Math.sin(b.phase * 18) * 0.85;
      b.leftWing.rotation.y = flap;
      b.rightWing.rotation.y = -flap;
    });

    // 3. Floating Pollen Animation
    if (this.pollenPoints) {
      const pos = this.pollenPoints.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) - delta * 0.08;
        if (py < 0.1) py = 3.5;
        let px = pos.getX(i) + Math.sin(this.windTime + i) * delta * 0.15 * windSpeed;
        let pz = pos.getZ(i) + Math.cos(this.windTime * 0.7 + i) * delta * 0.1 * windSpeed;
        pos.setXYZ(i, px, py, pz);
      }
      pos.needsUpdate = true;
    }

    // 4. Fireflies Animation
    if (this.firefliesPoints && this.firefliesPositions) {
      const mat = this.firefliesPoints.material as THREE.PointsMaterial;
      const targetOpacity = isNightOrTwilight ? 0.85 : 0.0;
      mat.opacity += (targetOpacity - mat.opacity) * 0.05;

      if (mat.opacity > 0.01) {
        const pos = this.firefliesPoints.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const idx = i * 3;
          let fx = pos.getX(i) + Math.sin(this.windTime * 0.6 + i * 1.5) * delta * 0.3;
          let fy = pos.getY(i) + Math.cos(this.windTime * 0.8 + i * 2.0) * delta * 0.25;
          let fz = pos.getZ(i) + Math.sin(this.windTime * 0.5 + i * 0.8) * delta * 0.3;

          if (fy < 0.2) fy = 2.2;
          if (fy > 2.5) fy = 0.3;

          pos.setXYZ(i, fx, fy, fz);
        }
        pos.needsUpdate = true;
      }
    }

    // 5. Carrot spawn animation (scale pop-in)
    this.carrots.forEach((carrot) => {
      if (carrot.mesh.scale.x < 1) {
        const nextScale = Math.min(1, carrot.mesh.scale.x + delta * 4);
        carrot.mesh.scale.set(nextScale, nextScale, nextScale);
      }
    });
  }
}
