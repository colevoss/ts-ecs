import * as T from "three";
import { Ecs, system } from "../ecs";
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
  { res: [Player, FpsScene] },
  function look({ resources, commands }) {
    const lookDelta = commands.timer.deltaTime / 10;

    const [player, scene] = resources;

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
  { res: [Player, FpsScene] },
  function move({ resources, commands }) {
    const [player, scene] = resources;
    const isSprinting = scene.input.inputs.sprint.pressed;

    const moveDetla = commands.timer.deltaTime * 50 * (isSprinting ? 1.5 : 0.5);
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
  { res: [FpsScene, Player] },
  function render({ resources }) {
    const [scene, player] = resources;

    scene.render(player.camera);
  }
);

const sceneSetupSystem = system(
  { res: [FpsScene] },
  function setupScene({ resources }) {
    const [scene] = resources;
    const floor = new Floor();

    scene.setup();
    scene.input.enable();

    const light = new T.PointLight(0xffffff, 3);
    scene.scene.add(light);
    scene.scene.add(floor);
  }
);

const spawnPlayerSystem = system(
  { res: [FpsScene, Player] },
  function spawnPlayer({ resources, commands }) {
    const [scene, player] = resources;

    scene.scene.add(player);
    commands.spawn().insert(new ProjectileManager(100));
  }
);

const shootSystem = system(
  { has: [ProjectileManager], res: [FpsScene] },
  function shoot({ components, resources, commands }) {
    const [scene] = resources;
    const isShooting = scene.input.inputs.click.clicked;

    if (!isShooting) {
      return;
    }

    const [, projectileManager] = components[0];

    if (!projectileManager.canShoot()) {
      return;
    }
    projectileManager.shoot();

    commands.spawn().insert(new Projectile()).insert(new Fire(5));
  }
);

const spawnProjectileSystem = system(
  { has: [Projectile, Fire], res: [Player, FpsScene] },
  function spawnProjectile({ components, resources, commands }) {
    if (components.length === 0) {
      return;
    }

    const [player, scene] = resources;
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
        .insert(new Fired(fire.value, commands.timer.betterDur));
    }
  }
);

const projectileSystem = system(
  { has: [Projectile, Fired], res: [Player, FpsScene] },
  function projectile({ components, commands }) {
    for (const [entity, projectile, fired] of components) {
      const distance = fired.value * commands.timer.deltaTime;

      projectile.translateZ(-distance);

      if (fired.isExpired(commands.timer.betterDur)) {
        commands.entity(entity).remove(fired).insert(new ExpiredProjectile());
      }
    }
  }
);

const despawnProjectileSystem = system(
  { has: [Projectile, ExpiredProjectile], res: [FpsScene] },
  function despawnProjectile({ components, resources, commands }) {
    const [scene] = resources;
    for (const [entity, projectile] of components) {
      scene.scene.remove(projectile);
      commands.entity(entity).remove(Projectile).remove(ExpiredProjectile);
    }
  }
);

// const fireProjectileSystem = system(
//   { has: [Projectile, Queued], without: [Fired] },
//   function fireProjectile({ components, commands }) {}
// );

export default function main() {
  const world = new Ecs();
  const scene = new FpsScene();
  const player = new Player(scene);

  // gameplay.enable();

  function renderWorld() {
    // console.log(t);
    requestAnimationFrame(renderWorld);
    world.tick();
  }

  world.addStartupSystem(sceneSetupSystem);
  world.addStartupSystem(spawnPlayerSystem);

  world.registerResource(scene);
  world.registerResource(player);

  // Should be last
  world.addSystem(moveSystem);
  world.addSystem(lookSystem);
  world.addSystem(shootSystem);
  world.addSystem(spawnProjectileSystem);
  world.addSystem(projectileSystem);
  world.addSystem(despawnProjectileSystem);

  world.addSystem(renderSystem);

  world.run(renderWorld);
}
