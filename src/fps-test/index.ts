import * as T from "three";
import {
  Ecs,
  Time,
  Event,
  Component,
  Parent,
  Child,
  StringComponent,
  System,
  EntitySystem,
} from "../ecs";
import { Player } from "./player";
import { FpsScene } from "./scene";
import {
  Projectile,
  Fired,
  Fire,
  ProjectileManager,
  ExpiredProjectile,
  ShootBundle,
} from "./projectile";
import { StatsPlugin } from "../stats";

export class MyEvent extends Event<string> {}
export class ShootEvent extends Event<null> {}

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

const lookSystem = System.init(
  { res: [Player, FpsScene, Time] },
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
).label("look");

const moveSystem = System.init(
  { res: [Player, FpsScene, Time] },
  function move({ resources }) {
    const [player, scene, time] = resources;
    const isSprinting = scene.input.inputs.sprint.pressed;

    const moveDetla = time.delta * 50 * (isSprinting ? 1.5 : 0.5);
    const moveForward = scene.input.inputs.move.y * moveDetla;
    const moveSide = scene.input.inputs.move.x * moveDetla;

    player.translateZ(-moveForward);
    player.translateX(moveSide);
  }
).label("move");

const renderSystem = System.init(
  { res: [FpsScene, Player] },
  function lazyRender({ resources }) {
    const [scene, player] = resources;
    scene.render(player.camera);
  }
).label("render");

const sceneSetupSystem = System.init(
  { res: [FpsScene, Time] },
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
).label("sceneSetup");

const spawnPlayerSystem = System.init(
  { res: [FpsScene, Player] },
  function spawnPlayer({ resources, commands }) {
    const [scene, player] = resources;

    scene.scene.add(player);
    commands.spawn().insert(new ProjectileManager(100));
  }
);

const shootSystem = System.init(
  { res: [FpsScene, Player], eventWriter: [ShootEvent] },
  function shoot({ resources, commands, query, eventWriters }) {
    const [scene, player] = resources;

    if (!scene.input.inputs.click.clicked) {
      return;
    }

    const [shootEvent] = eventWriters;

    const [, projectileManager] = query.run({ has: [ProjectileManager] })
      .components[0];

    if (!projectileManager.canShoot()) {
      return;
    }

    shootEvent.send(null);

    projectileManager.shoot();

    // commands.spawn().insert(new Projectile()).insert(new Fire(20));
    // commands.spawn().insert([new Projectile(), new Fire(20)]);
    const bundle = ShootBundle({
      projectile: new Projectile(),
      // fire: new Fire(20),
      fire: new Fire(20),
    });

    commands.spawn(bundle);

    player.shotsFired += 1;
  }
);

const spawnProjectileSystem = System.init(
  { has: [Projectile, Fire], res: [Player, FpsScene, Time] },
  function spawnProjectile({ components, resources, commands }) {
    if (components.length === 0) {
      return;
    }

    const [player, scene, time] = resources;
    const v = new T.Vector3();
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

const expireProjectileSystem = System.init(
  { res: [Time] },
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

const moveProjectileSystem = EntitySystem.init(
  { has: [Projectile, Fired], res: [Time] },
  function moveProjectile(components, { resources }) {
    const [time] = resources;
    const [, projectile, fired] = components;
    // const [scene, player] = resources;
    const distance = fired.value * time.delta;
    projectile.translateZ(-distance);
  }
);

const despawnProjectileSystem = System.init(
  { res: [FpsScene] },
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

const testPauseSystem = System.init(
  { res: [FpsScene, Time] },
  function pause({ resources }) {
    const [scene, time] = resources;

    if (scene.input.inputs.pause.clicked) {
      time.pause();
    } else {
      time.run();
    }
  }
);

const timeSystem = System.init(
  { res: [Time] },
  function tickTime({ resources }) {
    const [time] = resources;
    time.tick();
  }
);

const testEventSystem = System.init(
  { eventWriter: [MyEvent], res: [FpsScene, Time] },
  ({ eventWriters, resources }) => {
    const [scene, time] = resources;

    if (scene.testTimer.tick(time.delta)) {
      const [e] = eventWriters;
      e.send(new Date().toString());
    }
  }
);

const testEventReaderSystem = System.init(
  {
    eventReader: [MyEvent],
  },
  ({ eventReaders }) => {
    const [myEvent] = eventReaders;

    for (const events of myEvent.read()) {
      // console.log("READ EVENT", events);
    }
  }
);

const othertestEventReaderSystem = System.init(
  {
    eventReader: [MyEvent],
  },
  ({ eventReaders }) => {
    const [myEvent] = eventReaders;

    for (const events of myEvent.read()) {
      // console.log("OTHERREAD EVENT", events);
    }
  }
);

@Component()
class TestParent {}

@Component()
class TestChild extends StringComponent {}

const testParentChildSetupSystem = System.init({}, ({ commands }) => {
  for (let i = 0; i < 1; i++) {
    commands.spawn(new TestParent()).withChildren((parent) => {
      parent.spawn().insert(new TestChild("child " + i));
    });
  }
});

const testParentSystem = System.init(
  { has: [Child], with: [TestParent] },
  function ({ components, commands, query }) {
    // console.log(components);
    for (const [e, child] of components) {
      // console.log(child);
      for (const entity of commands.entity(e).getChildEntities(child)) {
        const results = query.queryEntity(entity.id(), { has: [TestChild] });
        if (!results) continue;

        const [e, testChild] = results;
        console.log(testChild.value, e);
      }
    }
  }
);

const tcQuery = { has: [Parent], with: [TestChild] };

const testChildSystem = System.init(tcQuery, ({ components, commands }) => {
  for (const [e, parent] of components) {
    // console.log(parent);
    const parentEntity = commands.entity(e).getParentEntity(parent);
    // console.log("PARENT", parentEntity?.id());
  }
});

export const World = new Ecs();

export default function main() {
  const scene = new FpsScene();
  const player = new Player(scene);
  const time = new Time();

  function renderWorld() {
    World.tick();
    requestAnimationFrame(renderWorld);
  }

  World.registerEvent(new MyEvent());
  World.registerEvent(new ShootEvent());

  World.addStartupSystem(sceneSetupSystem);
  World.addStartupSystem(spawnPlayerSystem);

  World.registerResource(time);
  World.registerResource(scene);
  World.registerResource(player);

  World.addSystem(timeSystem);
  World.addSystem(moveSystem);
  World.addSystem(lookSystem);

  World.addSystem(shootSystem);
  World.addSystem(moveProjectileSystem);

  World.addLateSystem(spawnProjectileSystem);
  World.addLateSystem(expireProjectileSystem);

  World.addSystem(testEventSystem);
  World.addSystem(testEventReaderSystem);
  World.addSystem(othertestEventReaderSystem);

  World.addSystem(despawnProjectileSystem);
  World.addSystem(testPauseSystem);

  // World.addStartupSystem(testParentChildSetupSystem);
  // World.addSystem(testParentSystem);
  // World.addSystem(testChildSystem);

  World.resisterPlugin(new StatsPlugin());

  // Should be last
  World.addSystem(renderSystem);

  World.run(renderWorld);
}
