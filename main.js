import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class World {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => {
      this.windowResize();
    }, false);

    // init camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(75, 20, 0);

    this.scene = new THREE.Scene();

    this.sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.position.set(20, 100, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.bias = -0.001;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 500.0;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500.0;
    this.sunLight.shadow.camera.left = 100;
    this.sunLight.shadow.camera.right = -100;
    this.sunLight.shadow.camera.top = 100;
    this.sunLight.shadow.camera.bottom = -100;
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight("#ffffff", 1);
    this.scene.add(this.ambientLight);

    this.controls = new OrbitControls(
      this.camera, this.renderer.domElement);
    this.controls.target.set(0, 20, 0);
    this.controls.update();

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

    this.RAF();
  }

  windowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  RAF() {
    requestAnimationFrame(() => {
      this.renderer.render(this.scene, this.camera);
      this.RAF();
    });
  }

}

let app = null;

window.addEventListener('DOMContentLoaded', () => {
  app = new World();
});





