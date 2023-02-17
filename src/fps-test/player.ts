import * as Three from "three";
import { FpsScene } from "./scene";

export class Player extends Three.Object3D {
  public camera: Three.PerspectiveCamera;
  public forward: Three.Vector3;
  public shotsFired: number = 0;

  constructor(scene: FpsScene) {
    super();

    this.camera = new Three.PerspectiveCamera(
      75,
      scene.width / scene.height,
      0.1,
      1000
    );

    this.add(this.camera);
    this.forward = new Three.Vector3();
  }

  public updateForwardVector() {
    this.getWorldDirection(this.forward);
    this.forward.normalize();
  }
}
