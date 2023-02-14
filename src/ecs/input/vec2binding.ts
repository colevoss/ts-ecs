import { InputBinding } from "./input";
import { KeyBind } from "./keybind";

export type Vec2 = {
  x: number;
  y: number;
};

export type Vec2BindingInput = {
  up: KeyBind;
  down: KeyBind;
  right: KeyBind;
  left: KeyBind;
};

export class Vec2Binding implements InputBinding {
  private input: Vec2BindingInput;

  constructor(input: Vec2BindingInput) {
    this.input = input;
  }

  public enable(): this {
    for (const k in this.input) {
      this.input[k as keyof Vec2BindingInput].enable();
    }

    return this;
  }

  public disable(): this {
    for (const k in this.input) {
      this.input[k as keyof Vec2BindingInput].disable();
    }

    return this;
  }

  public get y(): number {
    const up = Number(this.input.up.pressed);
    const down = -Number(this.input.down.pressed);

    return up + down;
  }

  public get x(): number {
    const right = Number(this.input.right.pressed);
    const left = -Number(this.input.left.pressed);

    return right + left;
  }
}
