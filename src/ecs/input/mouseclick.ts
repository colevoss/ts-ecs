import { InputBinding } from "./input";

export const MouseButton = {
  Left: 0,
  Right: 2,
  Middle: 1,
} as const;

export type MouseButton = typeof MouseButton[keyof typeof MouseButton];

export class MouseClickBinding implements InputBinding {
  private button: MouseButton;
  private isButtonPressed: boolean = false;

  constructor(button: MouseButton) {
    this.button = button;
  }

  public get clicked(): boolean {
    return this.isButtonPressed;
  }

  public get active(): boolean {
    return this.isButtonPressed;
  }

  public get pressed(): boolean {
    return this.isButtonPressed;
  }

  public enable(): this {
    document.addEventListener("mousedown", this.handler);
    document.addEventListener("mouseup", this.handler);
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    if (this.button === MouseButton.Right) {
      document.addEventListener("contextmenu", this.disableContextMenu);
    }

    return this;
  }

  public disable(): this {
    document.removeEventListener("mousedown", this.handler);
    document.removeEventListener("mouseup", this.handler);

    if (this.button === MouseButton.Right) {
      document.removeEventListener("contextmenu", this.disableContextMenu);
    }

    return this;
  }

  private handler = (event: MouseEvent) => {
    if (this.button !== event.button) {
      return;
    }

    this.isButtonPressed = event.type === "mousedown";
  };

  private disableContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };
}
