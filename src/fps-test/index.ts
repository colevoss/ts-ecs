import * as T from "three";
import {
  Ecs,
  eagerSystem,
  system,
  entitySystem,
  Time,
  Event,
  EventWriter,
} from "../ecs";
import { Player } from "./player";
import { FpsScene } from "./scene";
import {
  Projectile,
  Fired,
  Fire,
  ProjectileManager,
  ExpiredProjectile,
} from "./projectile";
import { Vector3 } from "three";

class MyEvent extends Event<string> {}

function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

class Floor extends T.Object3D {
  plane: T.Mesh;
  constructor() {
    super();

    const geometry = new T.PlaneGeometry(100, 100, 10, 10);
    const material = new T.MeshBasicMaterial({
      color: 0x808080,
      side: T.DoubleSide,
    });
    const plane = new T.Mesh(geometry, material);

    this.plane = plane;

    this.add(plane);

    this.rotateX(degToRad(-90));
    this.position.set(0, -10, -10);
  }
}

const lookSystem = system(
  [Player, FpsScene, Time],
  function lazyLook({ resources }) {
    const [player, scene, time] = resources;
    const lookDelta = time.delta / 10;

    const x = scene.input.inputs.look.x;
    const y = scene.input.inputs.look.y;
    const lookX = x * lookDelta;
    const lookY = y * lookDelta;

    player.camera.rotateX(-lookY);
    player.rotateY(-lookX);
    player.updateForwardVector();
  }
);

const moveSystem = system(
  [Player, FpsScene, Time],
  function move({ resources }) {
    const [player, scene, time] = resources;
    const isSprinting = scene.input.inputs.sprint.pressed;

    const moveDetla = time.delta * 50 * (isSprinting ? 1.5 : 0.5);
    const moveForward = scene.input.inputs.move.y * moveDetla;
    const moveSide = scene.input.inputs.move.x * moveDetla;

    if (moveForward === 0 && moveSide === 0) {
      return;
    }

    player.translateZ(-moveForward);
    player.translateX(moveSide);
  }
);

const renderSystem = system(
  [FpsScene, Player],
  function lazyRender({ resources }) {
    const [scene, player] = resources;
    scene.render(player.camera);
  }
);

const sceneSetupSystem = system(
  [FpsScene, Time],
  function setupScene({ resources }) {
    const [scene, time] = resources;
    const floor = new Floor();

    scene.setup();
    scene.input.enable();

    const light = new T.PointLight(0xffffff, 3);
    scene.scene.add(light);
    scene.scene.add(floor);

    time.run();
  }
);

const spawnPlayerSystem = eagerSystem(
  { res: [FpsScene, Player] },
  function spawnPlayer({ resources, commands }) {
    const [scene, player] = resources;

    scene.scene.add(player);
    commands.spawn().insert(new ProjectileManager(100));
  }
);

const shootSystem = system(
  [FpsScene],
  function shoot({ resources, commands, query }) {
    const [scene] = resources;

    if (!scene.input.inputs.click.clicked) {
      return;
    }

    const [, projectileManager] = query.run({ has: [ProjectileManager] })
      .components[0];

    if (!projectileManager.canShoot()) {
      return;
    }

    projectileManager.shoot();

    commands.spawn().insert(new Projectile()).insert(new Fire(20));
  }
);

const spawnProjectileSystem = eagerSystem(
  { has: [Projectile, Fire], res: [Player, FpsScene, Time] },
  function spawnProjectile({ components, resources, commands }) {
    if (components.length === 0) {
      return;
    }

    const [player, scene, time] = resources;
    const v = new Vector3();
    const playerLocation = player.getWorldPosition(v);

    for (const [entity, projectile, fire] of components) {
      projectile.position.set(
        playerLocation.x,
        playerLocation.y - 2,
        playerLocation.z
      );
      projectile.quaternion.set(
        player.quaternion.x,
        player.quaternion.y,
        player.quaternion.z,
        player.quaternion.w
      );
      scene.scene.add(projectile);

      commands
        .entity(entity)
        .remove(fire)
        .insert(new Fired(fire.value, time.duration));
    }
  }
);

const expireProjectileSystem = system(
  [Time],
  function expireProjectile({ commands, resources, query }) {
    const [time] = resources;
    const { components } = query.run({
      has: [Fired],
      with: [Projectile],
      without: [ExpiredProjectile],
    });

    for (const [entity, fired] of components) {
      if (fired.isExpired(time.duration)) {
        commands.entity(entity).remove(fired).insert(new ExpiredProjectile());
      }
    }
  }
);

const moveProjectileSystem = entitySystem(
  { has: [Projectile, Fired], res: [Time] },
  function moveProjectile(components, { resources }) {
    const [time] = resources;
    const [, projectile, fired] = components;
    // const [scene, player] = resources;
    const distance = fired.value * time.delta;
    projectile.translateZ(-distance);
  }
);

const despawnProjectileSystem = system(
  [FpsScene],
  function lazyDespawnProjectile({ resources, query, commands }) {
    const [scene] = resources;
    const { components } = query.run({ has: [Projectile, ExpiredProjectile] });

    for (const [entity, projectile] of components) {
      scene.scene.remove(projectile);
      // commands.entity(entity).remove(Projectile).remove(ExpiredProjectile);
      // commands.entity(entity).destroy();
      commands.entity(entity).kill();
    }
  }
);

const testPauseSystem = system([FpsScene, Time], function pause({ resources }) {
  const [scene, time] = resources;

  if (scene.input.inputs.pause.clicked) {
    time.pause();
  } else {
    time.run();
  }
});

const timeSystem = system([Time], function tickTime({ resources }) {
  const [time] = resources;
  time.tick();
});

const testEventSystem = eagerSystem(
  { eventWriter: EventWriter(MyEvent), res: [FpsScene, Time] },
  ({ eventWriters, resources }) => {
    const [scene, time] = resources;

    if (scene.testTimer.tick(time.delta)) {
      const [e] = eventWriters;
      e.send(new Date().toString());
    }
  }
);

export default function main() {
  const world = new Ecs();
  const scene = new FpsScene();
  const player = new Player(scene);
  const time = new Time();

  // gameplay.enable();

  function renderWorld() {
    world.tick();
    requestAnimationFrame(renderWorld);
  }

  world.registerEvent(new MyEvent());
  world.addStartupSystem(sceneSetupSystem);
  world.addStartupSystem(spawnPlayerSystem);

  world.registerResource(time);
  world.registerResource(scene);
  world.registerResource(player);

  world.addSystem(timeSystem);
  world.addSystem(moveSystem);
  world.addSystem(lookSystem);
  world.addSystem(shootSystem);
  world.addSystem(spawnProjectileSystem);

  world.addSystem(testEventSystem);

  world.addSystem(moveProjectileSystem);
  world.addSystem(expireProjectileSystem);
  world.addSystem(despawnProjectileSystem);
  world.addSystem(testPauseSystem);

  // Should be last
  world.addSystem(renderSystem);

  world.run(renderWorld);
}
