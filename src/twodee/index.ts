import { System, Time } from "../ecs";
import { TwoDee } from "./canvas";
import { Transform, Rect, Direction, Speed } from "./components";
import { World } from "./world";
import { RenderGroup } from "./render";

function randomSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

function random() {
  return randomSign() * Math.random();
}

// const World = new Ecs();
const scene = new TwoDee();

const testRectSystem = System.init(
  { res: [TwoDee] },
  function ({ resources, commands }) {
    const [scene] = resources;
    const centerY = Math.floor(scene.centerY);
    const centerX = Math.floor(scene.centerX);

    for (let i = 0; i < 2000; i++) {
      const transform = new Transform(centerX, centerY);
      const rect = new Rect(10, 10);
      const direction = new Direction(random(), random());
      const speed = new Speed(Math.abs(random()) * 200);

      commands.spawn([transform, rect, direction, speed]);
    }
  }
).label("TestRect");

const moveRectSystem = System.init(
  { has: [Transform, Direction, Speed], res: [Time] },
  function ({ components, resources }) {
    const [time] = resources;
    for (const [, transform, direction, speed] of components) {
      transform.x += direction.x * time.delta * speed.value;
      transform.y += direction.y * time.delta * speed.value;
    }
  }
);

const renderRectSystem = System.init(
  { has: [Transform, Rect], res: [TwoDee] },
  function ({ components, resources }) {
    const [scene] = resources;

    scene.ctx.fillStyle = "green";
    for (const [, transform, rect] of components) {
      // scene.ctx.save();
      scene.ctx.fillRect(transform.x, transform.y, rect.width, rect.height);
      // scene.ctx.restore();
    }
  }
);

World.addResource(scene);
World.addStartupSystem(testRectSystem);

World.addSystem(moveRectSystem);
World.addSystem(RenderGroup.in(World.Render));
World.addSystem(renderRectSystem.in(RenderGroup));

function renderWorld() {
  World.tick();
  requestAnimationFrame(renderWorld);
}

export default function main() {
  scene.setup();

  World.run(renderWorld);
}
