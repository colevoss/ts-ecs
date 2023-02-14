import { InputBinding } from "./input";
// import { KeyBind } from "./keybind";
// import { KeyCode } from "./keycodes";

type BindingMap = {
  [k: string]: InputBinding;
};

export class InputMap<T extends BindingMap> {
  public inputs: T;

  constructor(bindings: T) {
    this.inputs = bindings;
  }

  public enable() {
    for (const x in this.inputs) {
      this.inputs[x].enable();
    }
  }

  public disable() {
    for (const x in this.inputs) {
      this.inputs[x].disable();
    }
  }
}

export type InputMaps<T extends BindingMap> = {
  [k: string]: InputMap<T>;
};

type InputMapKey<T extends BindingMap, I extends InputMaps<T>> = keyof I;

export class InputManager<T extends BindingMap, I extends InputMaps<T>> {
  public maps: I;

  constructor(maps: I) {
    this.maps = maps;
  }

  public enable(mapName: InputMapKey<T, I>) {
    for (const map in this.maps) {
      if (map !== mapName) {
        this.maps[map].disable();
        continue;
      }

      this.maps[map].enable();
    }
  }

  public disable(mapName: InputMapKey<T, I>) {
    this.maps[mapName].disable();
  }
}
