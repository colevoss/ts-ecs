// TODO: Update for getLayoutMap
// @see https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap
export const KeyCodes = {
  Escape: "Escape",
  BackQuote: "BackQuote",
  Digit1: "Digit1",
  Digit2: "Digit2",
  Digit3: "Digit3",
  Digit4: "Digit4",
  Digit5: "Digit5",
  Digit6: "Digit6",
  Digit7: "Digit7",
  Digit8: "Digit8",
  Digit9: "Digit9",
  Digit0: "Digit0",
  Minus: "Minus",
  Equal: "Equal",
  ShiftLeft: "ShiftLeft",
  ShiftRight: "ShiftRight",
  Tab: "Tab",
  Backspace: "Backspace",
  BracketLeft: "BracketLeft",
  BracketRight: "BracketRight",
  Backslash: "Backslash",
  ControlRight: "ControlRight",
  ControlLeft: "ControlLeft",
  Semicolon: "Semicolon",
  Quote: "Quote",
  Comma: "Comma",
  Period: "Period",
  Slash: "Slash",
  Enter: "Enter",
  AltLeft: "AltLeft",
  AltRight: "AltRight",
  MetaLeft: "MetaLeft",
  MetaRight: "MetaRight",
  ArrowLeft: "ArrowLeft",
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  Q: "KeyQ",
  W: "KeyW",
  E: "KeyE",
  R: "KeyR",
  T: "KeyT",
  U: "KeyU",
  I: "KeyI",
  O: "KeyO",
  P: "KeyP",
  A: "KeyA",
  S: "KeyS",
  D: "KeyD",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  Z: "KeyZ",
  X: "KeyX",
  C: "KeyC",
  V: "KeyV",
  B: "KeyB",
  N: "KeyN",
  M: "KeyM",
} as const;

type KeyCodeValue = typeof KeyCodes[keyof typeof KeyCodes];

type Modifiers = {
  shift?: boolean;
  meta?: boolean;
  alt?: boolean;
  ctrl?: boolean;
};

export type CodeDefinition = Modifiers & {
  code: KeyCodeValue;
};

export type InputMap = {
  [k: string]: CodeDefinition;
};

class InputAction {
  private isPressed: boolean = false;

  public get pressed(): boolean {
    return this.isPressed;
  }

  public cancel() {
    this.isPressed = false;
  }

  public press() {
    this.isPressed = true;
  }
}

type CodeMapFunctions = {
  [code: string]: (event: KeyboardEvent) => void;
};

function createInputHandler(definition: CodeDefinition) {
  return (event: KeyboardEvent) => {
    if (
      event.shiftKey === definition.shift &&
      event.metaKey === definition.meta &&
      event.altKey === definition.alt &&
      event.ctrlKey === definition.ctrl
    ) {
      console.log(event);
    }
  };
}

export function createInputMap(inputMap: InputMap) {
  const map: { [action: keyof typeof inputMap]: InputAction } = {};
  const codeMap: CodeMapFunctions = {};

  for (const actionName in inputMap) {
    const definition = inputMap[actionName];
    codeMap[definition.code] = createInputHandler(definition);
  }

  const handler = (event: KeyboardEvent) => {
    const callback = codeMap[event.code];

    if (!callback) {
      return;
    }

    callback(event);
  };

  document.addEventListener("keydown", handler);
  document.addEventListener("keyup", handler);

  console.log("map:", map);
}

/* document.addEventListener("keydown", (event) => { */
/* }); */
