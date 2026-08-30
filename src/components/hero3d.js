import * as THREE from 'three';

export function initHero3D(containerElement) {
  if (!containerElement) return null;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080b11, 0.018);

  const width = containerElement.clientWidth || window.innerWidth;
  const height = containerElement.clientHeight || window.innerHeight;

  const isMobile = (window.innerWidth || width) < 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(isMobile ? 26 : 22, isMobile ? 20 : 18, isMobile ? 36 : 32);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    powerPreference: isMobile ? "default" : "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = !isMobile;
  if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  containerElement.innerHTML = '';
  containerElement.appendChild(renderer.domElement);

  // Lighting System
  const ambientLight = new THREE.AmbientLight(0x223344, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfff3d6, 2.5);
  dirLight.position.set(25, 45, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const cyanRimLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
  cyanRimLight.position.set(-30, 20, -25);
  scene.add(cyanRimLight);

  const goldAccentLight = new THREE.PointLight(0xd4af37, 3.5, 40);
  goldAccentLight.position.set(0, 15, 8);
  scene.add(goldAccentLight);

  // Group for the entire architectural model
  const architecturalGroup = new THREE.Group();
  scene.add(architecturalGroup);

  // Materials
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 1.2,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const darkFacadeMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.3
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x4a3b10,
    emissiveIntensity: 0.4
  });

  const glowingWindowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe6a3
  });

  const cyanGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe
  });

  // Base Grid / Plaza
  const gridHelper = new THREE.GridHelper(80, 40, 0xd4af37, 0x1e293b);
  gridHelper.position.y = -0.1;
  scene.add(gridHelper);

  const groundGeo = new THREE.PlaneGeometry(100, 100);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x06080d,
    roughness: 0.8,
    metalness: 0.5
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // BUILD THE 3D MAIN TOWER
  // 1. Tower Base Podium
  const podiumGeo = new THREE.BoxGeometry(10, 2.5, 10);
  const podium = new THREE.Mesh(podiumGeo, darkFacadeMaterial);
  podium.position.y = 1.25;
  podium.castShadow = true;
  architecturalGroup.add(podium);

  // Podium Gold Trims
  const podiumTrimGeo = new THREE.BoxGeometry(10.2, 0.2, 10.2);
  const podiumTrim = new THREE.Mesh(podiumTrimGeo, goldMaterial);
  podiumTrim.position.y = 2.5;
  architecturalGroup.add(podiumTrim);

  // 2. Main Glass Tower (Lower Tier)
  const lowerTowerGeo = new THREE.BoxGeometry(7.5, 12, 7.5);
  const lowerTower = new THREE.Mesh(lowerTowerGeo, glassMaterial);
  lowerTower.position.y = 8.5;
  lowerTower.castShadow = true;
  architecturalGroup.add(lowerTower);

  // Interior Floor Slabs & Glowing Window Accents
  for (let i = 0; i < 6; i++) {
    const slabGeo = new THREE.BoxGeometry(7.4, 0.15, 7.4);
    const slab = new THREE.Mesh(slabGeo, darkFacadeMaterial);
    slab.position.y = 3.5 + i * 1.8;
    architecturalGroup.add(slab);

    // Glowing window strips
    const windowStripGeo = new THREE.BoxGeometry(7.55, 0.2, 0.05);
    const windowStrip = new THREE.Mesh(windowStripGeo, glowingWindowMaterial);
    windowStrip.position.set(0, 4.2 + i * 1.8, 3.75);
    architecturalGroup.add(windowStrip);
  }

  // 3. Mid Cantilever Sky-Lounge / Amenity Deck
  const skyLoungeGeo = new THREE.BoxGeometry(9, 1.8, 9);
  const skyLounge = new THREE.Mesh(skyLoungeGeo, darkFacadeMaterial);
  skyLounge.position.y = 15;
  architecturalGroup.add(skyLounge);

  const skyLoungeGlowGeo = new THREE.BoxGeometry(9.1, 0.3, 9.1);
  const skyLoungeGlow = new THREE.Mesh(skyLoungeGlowGeo, goldMaterial);
  skyLoungeGlow.position.y = 15;
  architecturalGroup.add(skyLoungeGlow);

  // 4. Upper Penthouse Tier
  const upperTowerGeo = new THREE.BoxGeometry(6, 10, 6);
  const upperTower = new THREE.Mesh(upperTowerGeo, glassMaterial);
  upperTower.position.y = 20.5;
  architecturalGroup.add(upperTower);

  // 5. Crown & Helipad
  const crownGeo = new THREE.CylinderGeometry(2.8, 3.2, 1.2, 32);
  const crown = new THREE.Mesh(crownGeo, goldMaterial);
  crown.position.y = 26;
  architecturalGroup.add(crown);

  const helipadGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 32);
  const helipadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const helipad = new THREE.Mesh(helipadGeo, helipadMat);
  helipad.position.y = 26.65;
  architecturalGroup.add(helipad);

  // Helipad Perimeter Ring Glow
  const ringGeo = new THREE.RingGeometry(2.1, 2.3, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 26.72;
  architecturalGroup.add(ring);

  // Spire / Antenna
  const spireGeo = new THREE.CylinderGeometry(0.08, 0.3, 6, 16);
  const spire = new THREE.Mesh(spireGeo, goldMaterial);
  spire.position.y = 29.5;
  architecturalGroup.add(spire);

  const beaconGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const beacon = new THREE.Mesh(beaconGeo, cyanGlowMaterial);
  beacon.position.y = 32.5;
  architecturalGroup.add(beacon);

  // SURROUNDING SATELLITE TOWERS (Modern Urban Context)
  const surroundingConfigs = [
    { x: -14, z: -10, w: 5, h: 16, d: 5 },
    { x: 15, z: -12, w: 6, h: 20, d: 6 },
    { x: -12, z: 12, w: 4.5, h: 12, d: 4.5 },
    { x: 14, z: 10, w: 5.5, h: 14, d: 5.5 }
  ];

  surroundingConfigs.forEach((cfg) => {
    const bGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x151e2e,
      metalness: 0.6,
      roughness: 0.4
    });
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(cfg.x, cfg.h / 2, cfg.z);
    building.castShadow = true;
    architecturalGroup.add(building);

    // Subtle edge lines
    const edges = new THREE.EdgesGeometry(bGeo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x2a3b5c }));
    line.position.copy(building.position);
    architecturalGroup.add(line);
  });

  // PARTICLES / LUXURY GOLD AMBIANCE
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 50;
    particlePositions[i + 1] = Math.random() * 35;
    particlePositions[i + 2] = (Math.random() - 0.5) * 50;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.25,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse Interactivity & Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  const onMouseMove = (e) => {
    const rect = containerElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
    mouseX = x;
    mouseY = y;

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      architecturalGroup.rotation.y += deltaX * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  };

  const onMouseDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  window.addEventListener('mousemove', onMouseMove);
  containerElement.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  // Touch Support
  containerElement.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = containerElement.getBoundingClientRect();
      mouseX = (touch.clientX - rect.left) / rect.width * 2 - 1;
      mouseY = -((touch.clientY - rect.top) / rect.height * 2 - 1);
    }
  }, { passive: true });

  // Resize Handler
  const onResize = () => {
    if (!containerElement) return;
    const newWidth = containerElement.clientWidth;
    const newHeight = containerElement.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };
  window.addEventListener('resize', onResize);

  // Animation Loop
  let animationFrameId;
  let clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Constant slow rotation if not dragging
    if (!isDragging) {
      architecturalGroup.rotation.y += 0.0025;
    }

    // Parallax response to mouse
    targetRotationY = mouseX * 0.3;
    targetRotationX = mouseY * 0.15;
    camera.position.x += (22 + targetRotationY * 10 - camera.position.x) * 0.03;
    camera.position.y += (18 + targetRotationX * 6 - camera.position.y) * 0.03;
    camera.lookAt(0, 14, 0);

    // Beacon pulse
    const pulse = (Math.sin(elapsedTime * 4) + 1) * 0.5;
    beacon.scale.set(1 + pulse * 0.5, 1 + pulse * 0.5, 1 + pulse * 0.5);

    // Particle subtle float
    particleSystem.rotation.y = elapsedTime * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      containerElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      containerElement.innerHTML = '';
    }
  };
}
