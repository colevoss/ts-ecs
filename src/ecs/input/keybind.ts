import { KeyCode } from "./keycodes";
import { InputBinding } from "./input";

export type Modifiers = {
  shift?: boolean;
  meta?: boolean;
  alt?: boolean;
  ctrl?: boolean;
};

export const KeyEventType = {
  up: "keyup",
  down: "keydown",
} as const;

export type KeyEventType = typeof KeyEventType[keyof typeof KeyEventType];

export class KeyBind implements InputBinding {
  private keyPressed: boolean = false;
  private modifiersPressed: boolean = false;

  private code: KeyCode;
  private modifiers?: Modifiers;

  constructor(code: KeyCode, modifiers?: Modifiers) {
    this.code = code;
    this.modifiers = modifiers;
  }

  public get pressed(): boolean {
    return this.keyPressed && this.modifiersPressed;
  }

  public enable(): this {
    document.addEventListener("keydown", this.handler);
    document.addEventListener("keyup", this.handler);
    return this;
  }

  public disable(): this {
    document.removeEventListener("keydown", this.handler);
    document.removeEventListener("keyup", this.handler);
    return this;
  }

  private handler = (event: KeyboardEvent) => {
    const codeMatches = event.code === this.code;
    const isKeyDown = event.type === KeyEventType.down;

    // If it is the main key code, set to isKeyDown
    // If repeat, we have already set keyPressed to true,
    if (codeMatches && !event.repeat) {
      this.keyPressed = isKeyDown;
    }

    if (!this.keyPressed) {
      return;
    }

    const modifiersMatch = this.matchesModifiers(event);

    this.modifiersPressed = modifiersMatch;
  };

  private matchesModifiers(event: KeyboardEvent): boolean {
    if (!this.modifiers) {
      return true;
    }

    const modifiers = this.getEventModifiers(event);
    return (
      this.modifiers.shift === modifiers.shift &&
      this.modifiers.alt === modifiers.alt &&
      this.modifiers.meta === modifiers.meta &&
      this.modifiers.ctrl === modifiers.ctrl
    );
  }

  private getEventModifiers(event: KeyboardEvent): Modifiers {
    return {
      shift: event.getModifierState("Shift"),
      alt: event.getModifierState("Alt"),
      meta: event.getModifierState("Meta") || event.getModifierState("OS"),
      ctrl: event.getModifierState("Control"),
    };
  }
}
