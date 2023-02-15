import { ComponentList, Constructor, getComponentName } from "./components";
import { Entity, EntityAllocator } from "./entity";
import { SystemRunner } from "./system";
import { ResourceContainer } from "./resource";
import { Query } from "./query";
import { Commands } from "./commands";
import { Plugin } from "./plugin";
import { EventMap, Event } from "./events";

export class ComponentListMap {
  private componentListMap: Map<string, ComponentList<unknown>> = new Map();

  public getOrCreate<T>(t: unknown): ComponentList<T> | null {
    // @ts-ignore
    const componentName = getComponentName(t);

    if (!componentName) {
      throw new Error(`Not a component ${t}`);
    }

    if (!this.componentListMap.has(componentName)) {
      const componentList = new ComponentList<T>();
      this.componentListMap.set(componentName, componentList);
      return componentList;
    }

    return this.componentListMap.get(componentName) as ComponentList<T>;
  }

  public get<T>(t: unknown): ComponentList<T> | null {
    // @ts-ignore
    const componentName = getComponentName(t);

    if (!componentName) {
      throw new Error(`Not a component ${t}`);
    }

    return (
      (this.componentListMap.get(componentName) as ComponentList<T>) || null
    );
  }

  public get maps(): Map<string, ComponentList<unknown>> {
    return this.componentListMap;
  }
}

export class EntityBuilder {
  private entity: Entity;
  private ecs: Ecs;

  constructor(ecs: Ecs, entity: Entity) {
    this.ecs = ecs;
    this.entity = entity;
  }

  public insert<T>(component: T): EntityBuilder {
    this.ecs.insertComponentForEntity(this.entity, component);
    return this;
  }

  public remove<T>(component: T): EntityBuilder {
    this.ecs.remove(this.entity, component);
    return this;
  }

  public destroy(): boolean {
    return this.ecs.destroyEntity(this.entity);
  }

  public kill(): boolean {
    return this.ecs.killEntity(this.entity);
  }
}

export class Ecs {
  public allocator: EntityAllocator;
  public componentListMap: ComponentListMap;

  public eventMap: EventMap;

  private systems: SystemRunner[] = [];
  private startupSystems: SystemRunner[] = [];
  private plugins: Plugin[] = [];

  public resources: ResourceContainer;
  public commands: Commands;
  public query: Query;

  constructor() {
    this.allocator = new EntityAllocator();
    this.componentListMap = new ComponentListMap();
    this.resources = new ResourceContainer();
    this.commands = new Commands(this);
    this.query = new Query(this);
    this.eventMap = new EventMap();
  }

  public registerEvent<M>(eventType: Event<M>) {
    this.eventMap.registerEventType(eventType);
  }

  public registerResource<T extends Constructor>(t: InstanceType<T>) {
    this.resources.set(t);
  }

  public resisterPlugin<P extends Plugin>(plugin: P): Ecs {
    this.plugins.push(plugin);
    return this;
  }

  public run<T extends (...args: any[]) => void>(cb: T) {
    // this.timer.run();

    for (let i = 0; i < this.plugins.length; i++) {
      this.plugins[i].build(this);
    }

    for (let i = 0; i < this.startupSystems.length; i++) {
      this.startupSystems[i](this);
    }

    // this.timer.reset();

    cb();
  }

  public entity(entity: Entity) {
    return new EntityBuilder(this, entity);
  }

  public insertComponentForEntity<T>(entity: Entity, component: T) {
    this.componentListMap.getOrCreate(component)?.set(entity, component);
  }

  public spawn(): EntityBuilder {
    const entity = this.allocator.allocate();
    const entityBuilder = new EntityBuilder(this, entity);

    return entityBuilder;
  }

  public addSystem(system: SystemRunner) {
    this.systems.push(system);
    return this;
  }

  public addStartupSystem(system: SystemRunner) {
    this.startupSystems.push(system);
  }

  public tick() {
    // this.timer.tick(t);

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i](this);
    }
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
