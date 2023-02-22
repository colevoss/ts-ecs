import { ComponentListMap, Constructor } from "./components";
import { Entity, EntityAllocator } from "./entity";
import { ResourceContainer } from "./resource";
import { Query } from "./query";
// import { Commands } from "./commands";
import { Plugin } from "./plugin";
import { EntityBuilder } from "./entity-builder";
import { SystemRunnable, SystemRunner } from "./system";
import { Event, EventMap, EventSubscriber } from "./event";
import { Commands } from "./commands";

export class Ecs {
  public allocator: EntityAllocator;
  public componentListMap: ComponentListMap;

  public eventMap: EventMap;

  private plugins: Plugin[] = [];

  public resources: ResourceContainer;
  public commands: Commands;
  public query: Query;

  public systemsRunner: SystemRunner;
  public lateSystemRunner: SystemRunner;
  public startupSystemRunner: SystemRunner;

  constructor() {
    this.allocator = new EntityAllocator();
    this.componentListMap = new ComponentListMap();
    this.resources = new ResourceContainer();
    this.commands = new Commands(this);

    this.query = new Query(this);
    this.startupSystemRunner = new SystemRunner();
    this.lateSystemRunner = new SystemRunner();
    this.systemsRunner = new SystemRunner();

    this.eventMap = new EventMap();
  }

  public update() {
    this.commands.execute(this);
  }

  public registerEvent<M>(eventType: Event<M>): this {
    this.eventMap.registerEvent(eventType);
    return this;
  }

  public eventSubscriber<M>(
    eventType: typeof Event<M>
    // subscriber: EventSubscriberHandler,
  ): EventSubscriber<M> {
    const event = this.eventMap.getEventByType<M>(eventType);

    if (!event) {
      throw new Error("No event type");
    }

    // event.registerSubscriber(subscriber);
    return event.generateSubscriber();
  }

  public registerResource<T extends Constructor>(t: InstanceType<T>): this {
    this.resources.set(t);
    return this;
  }

  public resisterPlugin<P extends Plugin>(plugin: P): Ecs {
    this.plugins.push(plugin);
    return this;
  }

  public buildPlugins(): this {
    for (let i = 0; i < this.plugins.length; i++) {
      this.plugins[i].build(this);
    }
    return this;
  }

  public entity(entity: Entity) {
    return new EntityBuilder(this, entity);
  }

  public getEntityById(id: number) {
    return this.allocator.getById(id);
  }

  public insertComponentForEntity<T>(entity: Entity, component: T) {
    this.componentListMap.getOrCreate(component)?.set(entity, component);
  }

  public spawn(): EntityBuilder {
    const entity = this.allocator.allocate();
    const entityBuilder = new EntityBuilder(this, entity);

    return entityBuilder;
  }

  public addSystem(system: SystemRunnable): this {
    system.registerInWorld(this);
    this.systemsRunner.addSystem(system);
    return this;
  }

  public addLateSystem(system: SystemRunnable): this {
    system.registerInWorld(this);
    this.lateSystemRunner.addSystem(system);
    return this;
  }

  public addStartupSystem(system: SystemRunnable): this {
    this.startupSystemRunner.addSystem(system);
    return this;
  }

  public run(cb: (...args: any[]) => void): this {
    this.buildPlugins();

    this.startupSystemRunner.run(this);

    this.update();

    cb();
    return this;
  }

  public tick() {
    this.systemsRunner.run(this);
    this.update();

    this.lateSystemRunner.run(this);
    this.update();
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
}
