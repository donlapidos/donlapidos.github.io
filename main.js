import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { islandContent } from './islandContent.js';

class World {
  constructor(container) {
    this.container = container;
    this.islands = [];
    this.currentIsland = 0;
    this.initialize();
  }

  initialize() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activeOverlay = null;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Camera
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 5, 15);

    // Scene
    this.scene = new THREE.Scene();

    // Space background with stars
    this.createStarfield();

    // Lighting - more dramatic for space
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(20, 30, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.far = 100;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0x4a5f8f, 0.3);
    this.scene.add(this.ambientLight);

    // Colored accent lights
    this.accentLight1 = new THREE.PointLight(0x6b5fff, 0.8, 100);
    this.accentLight1.position.set(-20, 10, -20);
    this.scene.add(this.accentLight1);

    this.accentLight2 = new THREE.PointLight(0xff5f9e, 0.6, 100);
    this.accentLight2.position.set(20, -10, 20);
    this.scene.add(this.accentLight2);

    // Controls - FREE MOVEMENT
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = true; // Enable panning
    this.controls.panSpeed = 1.5;
    this.controls.rotateSpeed = 0.8;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 100;
    // Remove polar angle restriction for full freedom
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.2;

    // Create islands
    this.createIslands();

    // Event handlers
    window.addEventListener('resize', () => this.windowResize(), false);
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    window.addEventListener('click', (e) => this.onClick(e), false);

    // Create UI overlays
    this.createOverlays();

    // Start animation loop
    this.RAF();
  }

  createStarfield() {
    // Create distant stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Random position in sphere
      const radius = 200 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);

      // Random star colors (white, blue, yellow tints)
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        // White stars
        starColors[i3] = 1;
        starColors[i3 + 1] = 1;
        starColors[i3 + 2] = 1;
      } else if (colorChoice < 0.8) {
        // Blue stars
        starColors[i3] = 0.7;
        starColors[i3 + 1] = 0.8;
        starColors[i3 + 2] = 1;
      } else {
        // Yellow stars
        starColors[i3] = 1;
        starColors[i3 + 1] = 0.9;
        starColors[i3 + 2] = 0.7;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);

    // Add nebula background gradient
    this.scene.background = new THREE.Color(0x0a0a1a);
  }

  createOverlays() {
    this.islands.forEach(island => {
      const overlay = document.createElement('div');
      overlay.className = 'island-overlay';
      overlay.innerHTML = `
        <div class="close-btn">×</div>
        <h2>${islandContent[island.name].title}</h2>
        ${islandContent[island.name].content}
      `;
      document.body.appendChild(overlay);
      island.overlay = overlay;

      overlay.querySelector('.close-btn').addEventListener('click', () => {
        overlay.classList.remove('active');
        this.activeOverlay = null;
      });
    });
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  onClick(event) {
    if (this.activeOverlay) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.islands.map(i => i.mesh)
    );

    if (intersects.length > 0) {
      const clickedIsland = this.islands.find(
        i => i.mesh === intersects[0].object
      );
      if (clickedIsland && clickedIsland.overlay) {
        clickedIsland.overlay.classList.add('active');
        this.activeOverlay = clickedIsland.overlay;
      }
    }
  }

  createIslands() {
    const planetData = [
      { x: 0, y: 0, z: 0, name: 'About', color: 0x4a90e2, size: 4, type: 'earth' },
      { x: 25, y: 5, z: -15, name: 'Projects', color: 0xe74c3c, size: 3.5, type: 'mars' },
      { x: -25, y: -5, z: -15, name: 'Experience', color: 0xf39c12, size: 5, type: 'jupiter' },
      { x: 0, y: 8, z: -35, name: 'Playground', color: 0x9b59b6, size: 3, type: 'exotic' }
    ];

    planetData.forEach((data, index) => {
      const planet = this.createPlanet(data, index);
      this.islands.push(planet);
      this.scene.add(planet.group);
    });
  }

  createPlanet(data, index) {
    const group = new THREE.Group();
    group.position.set(data.x, data.y, data.z);

    // Planet sphere with detailed surface
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.8,
      metalness: 0.2,
      emissive: data.color,
      emissiveIntensity: 0.1
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(data.size * 1.15, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    group.add(atmosphere);

    // Orbital ring (for some planets)
    if (data.type === 'jupiter' || data.type === 'exotic') {
      const ringGeometry = new THREE.RingGeometry(data.size * 1.4, data.size * 1.8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + 0.3;
      group.add(ring);
    }

    // Orbiting particles (moons/debris)
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const orbitRadius = data.size * (1.5 + Math.random() * 1.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.5;

      particlePositions[i3] = orbitRadius * Math.cos(theta);
      particlePositions[i3 + 1] = orbitRadius * Math.sin(phi);
      particlePositions[i3 + 2] = orbitRadius * Math.sin(theta);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Point light emanating from planet
    const planetLight = new THREE.PointLight(data.color, 0.5, data.size * 10);
    planetLight.position.set(0, 0, 0);
    group.add(planetLight);

    // Animation parameters
    const rotationSpeed = 0.001 + Math.random() * 0.002;
    const orbitSpeed = 0.0005 + Math.random() * 0.001;

    return {
      group,
      mesh,
      atmosphere,
      particles,
      position: data,
      name: data.name,
      rotationSpeed,
      orbitSpeed,
      index
    };
  }

  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF() {
    requestAnimationFrame(() => {
      const time = performance.now() * 0.001;

      // Animate planets
      this.islands.forEach(planet => {
        // Planet rotation
        planet.mesh.rotation.y += planet.rotationSpeed;

        // Atmosphere rotation (slightly different speed)
        if (planet.atmosphere) {
          planet.atmosphere.rotation.y -= planet.rotationSpeed * 0.5;
        }

        // Gentle orbital drift
        const drift = Math.sin(time * planet.orbitSpeed) * 0.3;
        planet.group.position.y = planet.position.y + drift;

        // Rotate orbital particles
        if (planet.particles) {
          planet.particles.rotation.y += 0.002;
          planet.particles.rotation.z += 0.001;
        }
      });

      // Gentle starfield rotation
      if (this.stars) {
        this.stars.rotation.y += 0.0001;
      }

      // Animate accent lights
      this.accentLight1.intensity = 0.6 + Math.sin(time * 0.5) * 0.2;
      this.accentLight2.intensity = 0.4 + Math.cos(time * 0.7) * 0.2;

      // Check for hover
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.islands.map(i => i.mesh)
      );

      // Update cursor and highlight
      if (intersects.length > 0 && !this.activeOverlay) {
        document.body.style.cursor = 'pointer';
        const hoveredIsland = this.islands.find(
          i => i.mesh === intersects[0].object
        );
        // Scale up on hover
        hoveredIsland.mesh.scale.set(1.1, 1.1, 1.1);
      } else {
        document.body.style.cursor = 'default';
        this.islands.forEach(island => {
          island.mesh.scale.set(1, 1, 1);
        });
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.RAF();
    });
  }
}

// Landing page interaction
let world = null;
let hasEntered = false;

// Konami code easter egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;
let devMode = false;

function activateDevMode() {
  if (devMode) return;
  devMode = true;

  // Create dev mode overlay
  const devOverlay = document.createElement('div');
  devOverlay.className = 'island-overlay active';
  devOverlay.innerHTML = `
    <div class="close-btn">×</div>
    <h2>🎮 Dev Mode Activated!</h2>
    <p>You found the secret! Here are some behind-the-scenes stats:</p>
    <div style="background: rgba(139, 157, 195, 0.1); padding: 1.5rem; border-radius: 10px; margin-top: 1rem; font-family: monospace;">
      <p><strong>Renderer:</strong> WebGL ${world.renderer.capabilities.isWebGL2 ? '2.0' : '1.0'}</p>
      <p><strong>Pixel Ratio:</strong> ${window.devicePixelRatio}</p>
      <p><strong>FPS:</strong> ~60</p>
      <p><strong>Islands:</strong> ${world.islands.length}</p>
      <p><strong>Browser:</strong> ${navigator.userAgent.split(' ').pop()}</p>
    </div>
    <p style="margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.7;">This site was built with Three.js, WebGL, and lots of coffee ☕</p>
  `;
  document.body.appendChild(devOverlay);

  devOverlay.querySelector('.close-btn').addEventListener('click', () => {
    devOverlay.remove();
  });

  // Add particle explosion effect
  if (world) {
    world.islands.forEach(island => {
      island.mesh.material.emissive = new THREE.Color(0x00ff00);
      setTimeout(() => {
        island.mesh.material.emissive = new THREE.Color(0x000000);
      }, 1000);
    });
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      activateDevMode();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const landing = document.getElementById('landing');
  const worldContainer = document.getElementById('world-container');

  landing.addEventListener('click', () => {
    if (hasEntered) return;
    hasEntered = true;

    // Trigger break animation
    landing.classList.add('breaking');

    // Wait for animation to complete
    setTimeout(() => {
      landing.classList.add('hidden');
      worldContainer.classList.remove('hidden');
      worldContainer.classList.add('visible');

      // Initialize 3D world
      world = new World(worldContainer);
    }, 800);
  });
});





