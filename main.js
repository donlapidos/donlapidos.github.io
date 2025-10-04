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
    this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

    // Lighting
    this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.sunLight.position.set(10, 20, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.far = 50;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight(0x8b9dc3, 0.4);
    this.scene.add(this.ambientLight);

    // Rim light for dramatic effect
    this.rimLight = new THREE.DirectionalLight(0x6b7c9d, 0.5);
    this.rimLight.position.set(-10, 5, -10);
    this.scene.add(this.rimLight);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Skybox
    this.loader = new THREE.CubeTextureLoader();
    this.texture = this.loader.load([
      './resources/posx.jpg',
      './resources/negx.jpg',
      './resources/posy.jpg',
      './resources/negy.jpg',
      './resources/posz.jpg',
      './resources/negz.jpg',
    ]);
    this.scene.background = this.texture;

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
    const islandPositions = [
      { x: 0, y: 0, z: 0, name: 'About' },
      { x: 20, y: 2, z: -10, name: 'Projects' },
      { x: -20, y: -2, z: -10, name: 'Experience' },
      { x: 0, y: 3, z: -25, name: 'Playground' }
    ];

    islandPositions.forEach((pos, index) => {
      const island = this.createIsland(pos, index);
      this.islands.push(island);
      this.scene.add(island.group);
    });
  }

  createIsland(position, index) {
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);

    // Island base - geometric crystal shape
    const geometry = new THREE.OctahedronGeometry(3, 0);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(index * 0.25, 0.6, 0.5),
      roughness: 0.3,
      metalness: 0.7,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Wireframe overlay
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.color.setHex(0xffffff);
    line.material.opacity = 0.2;
    line.material.transparent = true;
    group.add(line);

    // Particle system around island
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);

      particleVelocities.push({
        theta: Math.random() * 0.02,
        phi: Math.random() * 0.01
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(index * 0.25, 0.7, 0.6),
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    // Floating animation
    const floatSpeed = 0.5 + Math.random() * 0.5;
    const floatOffset = Math.random() * Math.PI * 2;

    return {
      group,
      mesh,
      wireframe: line,
      particles,
      particleVelocities,
      position,
      name: position.name,
      floatSpeed,
      floatOffset,
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

      // Animate islands
      this.islands.forEach(island => {
        island.group.rotation.y += 0.005;
        island.group.position.y = island.position.y + Math.sin(time * island.floatSpeed + island.floatOffset) * 0.5;

        // Animate particles
        if (island.particles) {
          island.particles.rotation.y += 0.003;
          const positions = island.particles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += Math.sin(time + i) * 0.01;
          }
          island.particles.geometry.attributes.position.needsUpdate = true;
        }
      });

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





