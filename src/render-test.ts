import * as T from "three";
import { Ecs, eagerSystem, Component } from "./ecs";
import {
  Vec2Binding,
  KeyBind,
  KeyCode,
  InputMap,
  MouseMoveBinding,
  // InputManager,
} from "./ecs/input";
import { Scene } from "./scene";
import { Stats } from "./stats";

const gameplay = new InputMap({
  move: new Vec2Binding({
    up: new KeyBind(KeyCode.W),
    down: new KeyBind(KeyCode.S),
    right: new KeyBind(KeyCode.D),
    left: new KeyBind(KeyCode.A),
  }),

  look: new MouseMoveBinding(),
});

gameplay.enable();

const rand = (max: number) => {
  return Math.floor(Math.random() * max) - max / 2;
};

@Component()
class Position {
  public x: number;
  public y: number;
  public z: number;

  public vector: T.Vector3;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.vector = new T.Vector3(x, y, z);
  }
}

@Component()
class Capsule {
  public mesh: T.Mesh;

  constructor() {
    const color = new T.Color(Math.random(), Math.random(), Math.random());
    const geometry = new T.CapsuleGeometry(1, 1, 4, 8);
    const material = new T.MeshPhongMaterial({ color });
    const capsule = new T.Mesh(geometry, material);
    this.mesh = capsule;
  }
}

@Component()
class Cube {
  public mesh: T.Mesh;

  constructor() {
    const color = new T.Color(Math.random(), Math.random(), Math.random());
    const geometry = new T.BoxGeometry(1, 1, 1);
    const material = new T.MeshPhongMaterial({ color });
    this.mesh = new T.Mesh(geometry, material);
  }
}

@Component()
class Rotate {
  public rate: number;

  constructor(rate: number) {
    this.rate = rate;
  }
}

@Component()
class Move {
  public rate: number;

  constructor(rate: number) {
    this.rate = rate;
  }
}

const world = new Ecs();
world.registerResource(new Scene());
const stats = new Stats();
world.registerResource(stats);

const sceneSetup = eagerSystem(
  { res: [Scene] },
  function setup({ resources, commands }) {
    const [scene] = resources;
    scene.setup();
    const light = new T.SpotLight(0xffffff, 1);
    light.position.set(0, 10, 50);
    light.target.position.set(0, 0, 0);
    scene.scene.add(light);
    scene.scene.add(light.target);

    for (let i = 0; i < 500; i++) {
      const max = 50;
      commands
        .spawn()
        .insert(new Cube())
        .insert(new Rotate(0.25))
        .insert(new Move(rand(max - 10)))
        .insert(new Position(rand(max), rand(max), rand(max)));
    }

    for (let i = 0; i < 500; i++) {
      const max = 50;
      commands
        .spawn()
        .insert(new Capsule())
        .insert(new Rotate(0.25))
        .insert(new Move(rand(max - 10)))
        .insert(new Position(rand(max), rand(max), rand(max)));
    }
  }
);

const spawnCubes = eagerSystem(
  { has: [Cube, Position], res: [Scene] },
  function spawn({ components, resources }) {
    const [scene] = resources;
    for (const [, cube, position] of components) {
      cube.mesh.position.x = position.x;
      cube.mesh.position.y = position.y;
      cube.mesh.position.z = position.z;
      scene.scene.add(cube.mesh);
    }
  }
);

const spawnCapsuleSystem = eagerSystem(
  { has: [Capsule, Position], res: [Scene] },
  function spawnCapsules({ components, resources }) {
    const [scene] = resources;
    for (const [, capsule, position] of components) {
      capsule.mesh.position.x = position.x;
      capsule.mesh.position.y = position.y;
      capsule.mesh.position.z = position.z;
      scene.scene.add(capsule.mesh);
    }
  }
);

const renderScene = eagerSystem({ res: [Scene] }, function render({ resources }) {
  const [scene] = resources;

  scene.render();
});

const rotateSystem = eagerSystem(
  { has: [Cube, Rotate, Move] },
  function rotate({ components, commands }) {
    const deltaTime = commands.timer.deltaTime * 10;

    for (const [, cube, rotate] of components) {
      const rate = rotate.rate * deltaTime;
      cube.mesh.rotateX(rate);
      cube.mesh.rotateY(rate);

      // const distance = move.rate / deltaTime / 100;
      // cube.mesh.position.x += distance;
      // cube.mesh.position.y += distance;
      // cube.mesh.position.z += distance;
    }
  }
);

const rotateCapsuleSystem = eagerSystem(
  { has: [Capsule, Rotate] },
  function rotateCapsule({ components, commands }) {
    const deltaTime = commands.timer.deltaTime * 10;

    for (const [, capsule, rotate] of components) {
      const rate = rotate.rate * deltaTime;
      capsule.mesh.rotateX(rate);
      capsule.mesh.rotateY(rate);
    }
  }
);

const inputSystem = eagerSystem(
  { res: [Scene] },
  function input({ resources, commands }) {
    const deltaTime = commands.timer.deltaTime;
    const moveRight = gameplay.inputs.move.x;
    const moveForward = gameplay.inputs.move.y;

    if (moveForward === 0 && moveRight === 0) {
      return;
    }

    const [scene] = resources;

    scene.camera.position.x += moveRight * deltaTime * 10;
    scene.camera.position.z += -(moveForward * deltaTime) * 10;
  }
);

/* const moveSystem = system( */
/*   { has: [Cube, Move], res: [] }, */
/*   ({ components, commands }) => { */
/*     const deltaTime = commands.timer.deltaTime; */
/*     for (const [, cube, move] of components) { */
/*       const distance = move.rate / deltaTime / 100; */
/*       cube.mesh.position.x += distance; */
/*       cube.mesh.position.y += distance; */
/*       cube.mesh.position.z += distance; */
/*     } */
/*   } */
/* ); */

const startStats = eagerSystem({ res: [Stats] }, ({ resources }) => {
  const [stats] = resources;

  stats.startStats();
});

const statSystem = eagerSystem({ res: [Stats] }, function stat({ resources }) {
  const [stats] = resources;

  stats.tick();
});

setInterval(() => {
  // console.log("FPS", stats.getIndex());
  console.log("FPS", stats.fps());
}, 1000);

function render() {
  world.tick();
  requestAnimationFrame(render);
}

export default function main() {
  world.addStartupSystem(sceneSetup);
  world.addStartupSystem(spawnCubes);
  world.addStartupSystem(spawnCapsuleSystem);
  world.addStartupSystem(startStats);
  world.addSystem(rotateSystem);
  world.addSystem(rotateCapsuleSystem);
  world.addSystem(inputSystem);
  /* world.addSystem(moveSystem); */
  world.addSystem(renderScene);
  world.addSystem(statSystem);

  // function render() {
  //   requestAnimationFrame(render);
  //
  //   world.tick();
  // }
  world.run(render);
}
