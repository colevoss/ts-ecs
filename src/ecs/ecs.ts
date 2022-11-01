import { ComponentList, Constructor, getComponentName } from "./components";
import { Entity, EntityAllocator } from "./entity";
import {
  QueryParams,
  ComponentTypeTuple,
  ComponentResults,
  ComponentResult,
  SystemRunner,
  QueryResults,
  ResourceTypeResult,
} from "./system";
import { ResourceContainer } from "./resource";

export class Timer {
  /* start: number; */
  last: number;

  constructor() {
    this.last = Date.now();
    /* this.start = performance.now(); */
  }

  public reset() {
    /* this.start = performance.now(); */
  }

  public get deltaTime(): number {
    return Date.now() - this.last;
    /* return performance.now() - this.start; */
  }

  public tick() {
    this.last = Date.now();
  }
}

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
}

export class Commands {
  private ecs: Ecs;
  public timer: Timer;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
    this.timer = ecs.timer;
  }

  public entity(entity: Entity): EntityBuilder {
    return new EntityBuilder(this.ecs, entity);
  }

  // TODO: Refactor this to remove `Ecs.spawn`
  public spawn(): EntityBuilder {
    return this.ecs.spawn();
  }
}

export class Ecs {
  public allocator: EntityAllocator;
  public componentListMap: ComponentListMap;
  private systems: SystemRunner[] = [];
  private startupSystems: SystemRunner[] = [];
  public timer: Timer;
  private resources: ResourceContainer;
  private commands: Commands;

  constructor() {
    this.allocator = new EntityAllocator();
    this.componentListMap = new ComponentListMap();
    this.timer = new Timer();
    this.resources = new ResourceContainer();
    this.commands = new Commands(this);
  }

  public registerResource<T extends Constructor>(t: InstanceType<T>) {
    this.resources.set(t);
  }

  public run(cb: () => void) {
    for (const startup of this.startupSystems) {
      startup(this);
    }

    this.timer.reset();

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
    for (const system of this.systems) {
      system(this);
    }
    this.timer.tick();
  }

  public remove<C>(entity: Entity, component: C): boolean {
    const list = this.componentListMap.get<C>(component);

    if (!list) {
      return false;
    }

    return list.remove(entity);
  }

  public query<
    C extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple
  >(query: QueryParams<C, W, Wo, R>): QueryResults<C, R> {
    const hasQuery = query.has;
    const withQuery = query.with;
    const withoutQuery = query.without;
    const resourceQuery = query.res;

    const resources = [];
    const componentsResult: ComponentResults<C> = [];

    for (const resourceType of resourceQuery) {
      resources.push(this.resources.getResource(resourceType));
    }

    for (const entry of this.allocator.entities) {
      const components = [entry] as unknown as ComponentResults<C>;

      let doesMatch = true;

      if (withoutQuery.length) {
        for (const withoutQueryComponent of withoutQuery) {
          // Get comopnent list
          const list = this.componentListMap.get<typeof withoutQueryComponent>(
            withoutQueryComponent
          );

          if (!list) {
            continue;
          }

          // If the entity has this component, we dont want this entity
          doesMatch = !list.has(entry);
        }

        if (!doesMatch) {
          continue;
        }
      }

      if (withQuery.length) {
        for (const withQueryComponent of withQuery) {
          const list =
            this.componentListMap.get<typeof withQueryComponent>(
              withQueryComponent
            );

          if (!list) {
            doesMatch = false;
            continue;
          }

          // If the entity has this component, we dont want this entity
          doesMatch = list.has(entry);
        }

        if (!doesMatch) {
          continue;
        }
      }

      if (hasQuery.length) {
        for (const hasQueryComponent of hasQuery) {
          const list =
            this.componentListMap.get<typeof hasQueryComponent>(
              hasQueryComponent
            );

          if (!list) {
            doesMatch = false;
            continue;
          }

          // If the entity has this component, we dont want this entity
          const component = list.get(entry);

          if (!component) {
            doesMatch = false;
          } else {
            components.push(
              // @ts-ignore
              component as InstanceType<typeof hasQueryComponent>
            );
          }
        }

        if (!doesMatch) {
          continue;
        }

        componentsResult.push(components as ComponentResult<C>);
      }
    }

    return {
      components: componentsResult,
      resources: resources as ResourceTypeResult<R>,
      commands: this.commands,
    };
  }
}
