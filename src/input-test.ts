// import {
//   KeyCode,
//   KeyBind,
//   Vec2Binding,
//   // KeyEventType,
//   MouseClickBinding,
//   MouseButton,
//   MouseMoveBinding,
// } from "./ecs/input";
// import { InputMap, InputManager } from "./ecs/input/input-map";
//
// const e = new KeyBind(KeyCode.E, { shift: true });
// const sprint = new KeyBind(KeyCode.ShiftLeft);
// // sprint.enable();
//
// const move = new Vec2Binding({
//   up: new KeyBind(KeyCode.W),
//   down: new KeyBind(KeyCode.S),
//   right: new KeyBind(KeyCode.D),
//   left: new KeyBind(KeyCode.A),
// });
//
// // move.enable();
//
// const mouseClick = new MouseClickBinding(MouseButton.Left);
// // mouseClick.enable();
//
// const look = new MouseMoveBinding();
// look.enable();

// const gameplay = new InputMap({
//   e,
//   sprint,
//   move,
//   look,
//   mouseClick,
// });
//
// const menu = new InputMap({
//   e,
//   sprint,
// });

// const manager = new InputManager({
//   menu,
//   gameplay,
// });

// const x = manager.maps.gameplay.inputs.sprint;

const render = () => {
  // if (e.pressed) {
  // if (e.pressed && sprint.pressed) {
  //   console.log("PRESSED", e);
  // }
  // console.log(move.x, move.y);
  // const sprintMult = sprint.pressed ? 10 : 1;
  // const direction = [move.x * sprintMult, move.y * sprintMult];
  requestAnimationFrame(render);
};

export default function main() {
  // render();
  console.log("");
}
