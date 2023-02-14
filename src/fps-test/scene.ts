import * as Three from "three";

import {
  InputMap,
  KeyBind,
  KeyCode,
  MouseButton,
  MouseClickBinding,
  MouseMoveBinding,
  Vec2Binding,
} from "../ecs/input";

export function initGameplayInput(element: HTMLCanvasElement) {
  const gameplay = new InputMap({
    look: new MouseMoveBinding({
      lockPointer: true,
      pointerLockElement: element,
    }),
    move: new Vec2Binding({
      up: new KeyBind(KeyCode.W),
      down: new KeyBind(KeyCode.S),
      right: new KeyBind(KeyCode.D),
      left: new KeyBind(KeyCode.A),
    }),
    click: new MouseClickBinding(MouseButton.Left),
    sprint: new KeyBind(KeyCode.ShiftLeft),
  });

  return gameplay;
}

export class FpsScene {
  public scene: Three.Scene;
  public renderer: Three.WebGLRenderer;
  public domElement: HTMLCanvasElement;
  public input: ReturnType<typeof initGameplayInput>;

  public get width(): number {
    return window.innerWidth;
  }

  public get height(): number {
    return window.innerHeight;
  }

  constructor() {
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer();
    this.domElement = this.renderer.domElement;
    this.input = initGameplayInput(this.domElement);
    this.renderer.setSize(this.width, this.height);
  }

  public setup() {
    document.body.appendChild(this.domElement);
  }

  public render(camera: Three.PerspectiveCamera) {
    this.renderer.render(this.scene, camera);
  }
}
