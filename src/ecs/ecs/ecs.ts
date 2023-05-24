import { Commands } from "../commands";
import { ComponentListMap, Constructor } from "../component";
import { Entity, EntityAllocator } from "../entity";
import { EventMap, Event, EventSubscriber } from "../event";
import { Plugin } from "../plugin";
import { Query } from "../query";
import { ResourceContainer } from "../resource";
import { SystemGroup } from "../system";

export const innerecs = Symbol("innerecs");

export class InnerEcs {
  public allocator: EntityAllocator;
  public componentListMap: ComponentListMap;
  public eventMap: EventMap;
  public plugins: Plugin[] = [];
  public resources: ResourceContainer;

  constructor() {
    this.allocator = new EntityAllocator();
    this.componentListMap = new ComponentListMap();
    this.resources = new ResourceContainer();
    this.eventMap = new EventMap();
  }

  public insertComponentForEntity<T>(entity: Entity, component: T) {
    this.componentListMap.getOrCreate(component)?.set(entity, component);
  }

  public remove<C>(entity: Entity, component: C): boolean {
    const list = this.componentListMap.get<C>(component);

    if (!list) {
      return false;
    }

    return list.remove(entity);
  }

  public destroyEntity(entity: Entity): boolean {
    this.componentListMap.maps.forEach((map) => {
      map.remove(entity);
    });

    return this.allocator.dealloc(entity);
  }

  public killEntity(entity: Entity): boolean {
    return this.allocator.dealloc(entity);
  }

  public getEntityById(id: number) {
    return this.allocator.getById(id);
  }
}

export class Ecs {
  public readonly [innerecs]: InnerEcs;
  public readonly commands: Commands;
  public readonly query: Query;

  private readonly coreSystems: SystemGroup;

  public readonly Startup: SystemGroup;
  public readonly Update: SystemGroup;
  public readonly LateUpdate: SystemGroup;
  public readonly Render: SystemGroup;
  public readonly Last: SystemGroup;

  constructor() {
    this[innerecs] = new InnerEcs();
    this.commands = new Commands(this);
    this.query = new Query(this);

    this.coreSystems = new SystemGroup().label("Core");
    this.Startup = new SystemGroup().label("CoreStartup");

    this.Update = new SystemGroup().label("CoreUpdate");
    this.LateUpdate = new SystemGroup().label("CoreLateUpdate");
    this.Render = new SystemGroup().label("CoreRender");

    this.Last = new SystemGroup().label("CoreLast");

    this.coreSystems.add(this.Update);
    this.coreSystems.add(this.LateUpdate.after(this.Update));
    this.coreSystems.add(this.Render.after(this.LateUpdate));
    this.coreSystems.add(this.Last.after(this.Render));
  }

  public run(cb: (...args: any[]) => void): this {
    this.buildPlugins();

    this.Startup.run(this);
    this.update();

    cb();
    return this;
  }

  public tick() {
    this.Update.run(this);
    this.update();

    this.LateUpdate.run(this);
    this.update();

    this.Render.run(this);
    this.update();

    this.Last.run(this);
    this.update();
  }

  public addEvent<M>(event: Event<M>): this {
    this[innerecs].eventMap.registerEvent(event);
    return this;
  }

  public subscriber<M>(eventType: typeof Event<M>): EventSubscriber<M> {
    const event = this[innerecs].eventMap.getEventByType<M>(eventType);

    if (!event) {
      throw new Error("No event type");
    }

    return event.generateSubscriber();
  }

  public addResource<T extends Constructor>(resource: InstanceType<T>): this {
    this[innerecs].resources.set(resource);
    return this;
  }

  public addPlugin<P extends Plugin>(plugin: P): this {
    this[innerecs].plugins.push(plugin);
    return this;
  }

  public addStartupSystem(system: SystemGroup): this {
    system.registerInWorld(this);
    this.Startup.add(system);
    return this;
  }

  public addSystem(system: SystemGroup): this {
    system.registerInWorld(this);
    if (!system.hasIn()) {
      system.in(this.Update);
    }

    this.coreSystems.add(system);
    return this;
  }

  private update() {
    this.commands.execute(this);
  }

  // TODO: Update plugin to accept new ecs
  private buildPlugins(): this {
    for (let i = 0; i < this[innerecs].plugins.length; i++) {
      this[innerecs].plugins[i].build(this);
    }
    return this;
  }

  // TODO: System management
}
