import { Component } from "./components";
import { Ecs, Timer } from "./ecs";
import { Entity } from "./entity";
import { System, QueryParams, system } from "./system";

const ecs = new Ecs();

@Component()
class Position {
  constructor(public x: number, public y: number) {}
}

@Component()
class Volume {}

@Component()
class Pan {}

/* ecs.spawn().insert(new Position(1, 2)); */
/* ecs.spawn().insert(new Position(3, 4)).insert(new Volume()); */
/* ecs.spawn().insert(new Position(5, 6)).insert(new Volume()); */

for (let i = 0; i < 20000; i++) {
  ecs
    .spawn()
    .insert(new Position(i, i + 1))
    .insert(new Volume());
  /* .insert(new Pan()); */
}

/* console.log(ecs); */

/* ecs.registerSystem(PositionSystem); */
/* ecs.registerSystem(VolumeSystem); */
const hello = () => {};

const PositionSystem = system({ has: [Position] }, (results, ecs) => {
  for (const [entity, position] of results) {
    if (position.x % 2 == 0) {
      ecs.entity(entity).insert(new Pan());
    }
    /* console.log(position); */
    /* position.x = position.y; */
    hello();
  }
});

const VolumeSystem = system({ has: [Volume] }, (results) => {
  for (const [] of results) {
    1 + 1;
    hello();
  }
});

ecs.addSystem(PositionSystem);
ecs.addSystem(VolumeSystem);

/* ecs.registerNewSystem(new PositionSystem()); */
/* ecs.registerNewSystem(new VolumeSystem()); */

export const _test = () => {
  let i = 0;
  const iterations = 1000;
  const framerate = 16;

  console.log("Starting test");

  ecs.timer.reset();
  const timeout = setInterval(() => {
    console.time("tick");
    ecs.tick();
    /* console.log(ecs.timer.deltaTime); */
    console.timeEnd("tick");

    if (i >= iterations) {
      clearInterval(timeout);
      console.log("DONE!!!");
    }

    i++;
  }, framerate);
};

function render() {
  requestAnimationFrame(render);

  ecs.tick();
}

ecs.run(render);

export const test = () => {
  function run() {
    console.time("tick");
    ecs.tick();
    console.timeEnd("tick");

    window.requestAnimationFrame(run);
  }

  window.requestAnimationFrame(run);
};
