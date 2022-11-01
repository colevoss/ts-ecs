import "./style.css";
import * as Three from "three";

export class Scene {
  public scene: Three.Scene;
  public camera: Three.PerspectiveCamera;
  public renderer: Three.WebGLRenderer;

  constructor() {
    this.scene = new Three.Scene();

    this.camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new Three.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public setup() {
    /* const centerW = window.innerWidth / 2; */
    /* const centerH = window.innerHeight / 2; */
    document.body.appendChild(this.renderer.domElement);
    this.camera.position.z = 50;
    this.camera.position.x = 0;
    this.camera.position.y = 0;
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
