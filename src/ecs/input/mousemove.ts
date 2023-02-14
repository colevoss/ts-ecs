import { InputBinding } from "./input";

export type MouseMovement = {
  x: number;
  y: number;
};

export type MouseMoveBindingOptions = {
  lockPointer?: boolean;
  pointerLockElement?: HTMLCanvasElement;
};

export class MouseMoveBinding implements InputBinding {
  private _movement: MouseMovement = {
    x: 0,
    y: 0,
  };

  private pointerlock: boolean;
  private pointerLockElement?: HTMLCanvasElement;

  private animFrameId?: number;

  constructor(options?: MouseMoveBindingOptions) {
    const bindingOptions = {
      lockPointer: false,
      ...options,
    };

    this.pointerlock = bindingOptions.lockPointer;

    if (this.pointerlock) {
      if (!options?.pointerLockElement) {
        throw new Error("Pointer lock must have a DOM element to attach to");
      }

      this.pointerLockElement = options.pointerLockElement;
    }
  }

  public get x(): number {
    return this._movement.x;
  }

  public get y(): number {
    return this._movement.y;
  }

  public get movement(): MouseMovement {
    return this._movement;
  }

  public get hasMoved(): boolean {
    return this._movement.x !== 0 && this._movement.y !== 0;
  }

  public get hasXMoved(): boolean {
    return this._movement.x !== 0;
  }

  public get hasYMoved(): boolean {
    return this._movement.x !== 0;
  }

  public enable(): this {
    document.addEventListener("mousemove", this.handler);
    this.enablePointerLock();
    return this;
  }

  public disable(): this {
    document.removeEventListener("mousemove", this.handler);
    this.cancelReset();
    return this;
  }

  private enablePointerLock() {
    if (!this.pointerlock || !this.pointerLockElement) {
      return;
    }

    this.pointerLockElement.addEventListener(
      "click",
      this.pointerLockEnableHandler
    );
  }

  private pointerLockEnableHandler = () => {
    console.log("Requesting pointer lock", this.pointerLockElement);
    if (document.pointerLockElement == this.pointerLockElement) {
      return;
    }
    // @ts-ignore
    this.pointerLockElement
      // @ts-ignore
      .requestPointerLock({
        unadjustedMovement: true,
      })
      // @ts-ignore
      .then(() => {
        console.log("Pointer lock successful", this.pointerLockElement);
        // this.pointerLockElement!.removeEventListener(
        //   "click",
        //   this.pointerLockEnableHandler
        // );
      })
      // @ts-ignore
      .catch((err) => {
        console.error(err);
      });
  };

  private reset = () => {
    console.log("Resetting");
    this._movement.x = 0;
    this._movement.y = 0;
    this.cancelReset();
  };

  private cancelReset() {
    if (this.animFrameId) {
      clearTimeout(this.animFrameId);
    }
  }

  private startReset() {
    this.animFrameId = setTimeout(this.reset, 16);
  }

  public handler = (event: MouseEvent) => {
    this.cancelReset();

    this._movement.x = event.movementX;
    this._movement.y = event.movementY;

    this.startReset();
  };
}
