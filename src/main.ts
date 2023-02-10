import * as T from "three";
import { Ecs, system, Component, createInputMap, KeyCodes } from "./ecs";
import { Scene } from "./scene";

createInputMap({
  forward: {
    code: KeyCodes.W,
    shift: true,
  },
  /* otherForward: { */
  /*   code: KeyCodes.W, */
  /* }, */
  right: {
    code: KeyCodes.D,
    shift: false,
  },
});

/* document.addEventListener("keydown", (event) => { */
/*   console.log(event); */
/* }); */
/* document.addEventListener("keyup", (event) => { */
/*   console.log(event); */
/* }); */

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

const sceneSetup = system({ res: [Scene] }, ({ resources, commands }) => {
  const [scene] = resources;
  scene.setup();
  const light = new T.SpotLight(0xffffff, 1);
  light.position.set(0, 10, 50);
  light.target.position.set(0, 0, 0);
  scene.scene.add(light);
  scene.scene.add(light.target);

  for (let i = 0; i < 100; i++) {
    const max = 50;
    commands
      .spawn()
      .insert(new Cube())
      .insert(new Rotate(0.25))
      .insert(new Move(rand(max - 10)))
      .insert(new Position(rand(max), rand(max), rand(max)));
  }
});

const spawnCubes = system(
  { has: [Cube, Position], res: [Scene] },
  ({ components, resources }) => {
    const [scene] = resources;
    for (const [, cube, position] of components) {
      cube.mesh.position.x = position.x;
      cube.mesh.position.y = position.y;
      cube.mesh.position.z = position.z;
      scene.scene.add(cube.mesh);
    }
  }
);

const renderScene = system({ res: [Scene] }, ({ resources }) => {
  const [scene] = resources;

  scene.render();
});

const rotateSystem = system(
  { has: [Cube, Rotate, Move], with: [], without: [], res: [] },
  ({ components, commands }) => {
    const deltaTime = commands.timer.deltaTime;

    for (const [, cube, rotate, move] of components) {
      cube.mesh.rotateX(rotate.rate / deltaTime);
      cube.mesh.rotateY(rotate.rate / deltaTime);

      const distance = move.rate / deltaTime / 100;
      cube.mesh.position.x += distance;
      cube.mesh.position.y += distance;
      cube.mesh.position.z += distance;
    }
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

world.addStartupSystem(sceneSetup);
world.addStartupSystem(spawnCubes);
world.addSystem(rotateSystem);
/* world.addSystem(moveSystem); */
world.addSystem(renderScene);

function render() {
  requestAnimationFrame(render);

  world.tick();
}
world.run(render);
