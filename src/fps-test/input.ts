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
  });

  return gameplay;
}
