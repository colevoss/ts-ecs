import { Ecs } from "../ecs";
import { Entity } from "../entity";
import {
  ComponentTypeTuple,
  ResourceQuery,
  ResourceTypeResult,
  ComponentResult,
  ComponentQuery,
  ComponentResults,
  QueryRunResults,
  QueryRunParams,
} from "./types";

export class Query {
  private ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public run<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple
  >(query: Partial<QueryRunParams<H, W, Wo, R>>): QueryRunResults<H, R> {
    const resources = this.queryResources(query);
    const components = this.queryComponents(query);

    return {
      resources,
      components,
    };
  }

  public queryResources<R extends ComponentTypeTuple>(
    query: Partial<ResourceQuery<R>>
  ): ResourceTypeResult<R> {
    const resources = [];

    if (!query.res || query.res.length === 0) {
      return [] as ResourceTypeResult<R>;
    }

    for (let i = 0; i < query.res.length; i++) {
      resources.push(this.ecs.resources.getResource(query.res[i]));
    }

    return resources as ResourceTypeResult<R>;
  }

  public queryComponents<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple
  >(query: Partial<ComponentQuery<H, W, Wo>>): ComponentResults<H> {
    const entities: ComponentResults<H> = [];

    this.componentQuery(query, (components) => {
      entities.push(components);
    });

    return entities;
  }

  public queryEntity<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple
  >(
    entity: Entity,
    query: Partial<ComponentQuery<H, W, Wo>>
  ): ComponentResult<H> | false {
    if (!entity.isLive) {
      return false;
    }

    const components = [entity] as ComponentResult<H>;

    let doesMatch = true;

    if (query.without) {
      for (let i = 0; i < query.without.length; i++) {
        const withoutQueryComponent = query.without[i];
        const list = this.ecs.componentListMap.get<
          typeof withoutQueryComponent
        >(withoutQueryComponent);

        if (!list) {
          continue;
        }

        doesMatch = !list.has(entity);
      }

      if (!doesMatch) {
        return false;
      }
    }

    if (query.with) {
      for (let i = 0; i < query.with.length; i++) {
        const component = query.with[i];
        const list = this.ecs.componentListMap.get<typeof component>(component);

        // Cannot match if the component list does not exist
        // Cannot match if the entity does not have component
        if (!list || !list.has(entity)) {
          return false;
        }
      }
    }

    if (query.has) {
      for (let i = 0; i < query.has.length; i++) {
        const hasComponent = query.has[i];
        const list = this.ecs.componentListMap.get(hasComponent);

        if (!list) {
          doesMatch = false;
          continue;
        }

        const component = list.get(entity);

        if (!component) {
          doesMatch = false;
        } else {
          // @ts-ignore
          components.push(component as InstanceType<typeof hasComponent>);
        }
      }

      if (!doesMatch) {
        return false;
      }
    }

    return components;
  }

  public componentQuery<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple
  >(
    query: Partial<ComponentQuery<H, W, Wo>>,
    cb: (components: ComponentResult<H>) => void
  ) {
    for (let i = 0; i < this.ecs.allocator.entities.length; i++) {
      const entry = this.ecs.allocator.entities[i];

      if (!entry.isLive) {
        continue;
      }

      const components = [entry] as unknown as ComponentResult<H>;

      let doesMatch = true;

      if (query.without) {
        for (let i = 0; i < query.without.length; i++) {
          const withoutQueryComponent = query.without[i];
          const list = this.ecs.componentListMap.get<
            typeof withoutQueryComponent
          >(withoutQueryComponent);

          if (!list) {
            continue;
          }

          doesMatch = !list.has(entry);
        }

        if (!doesMatch) {
          continue;
        }
      }

      if (query.with) {
        for (let i = 0; i < query.with.length; i++) {
          const component = query.with[i];
          const list =
            this.ecs.componentListMap.get<typeof component>(component);

          if (!list) {
            doesMatch = false;
            continue;
          }

          doesMatch = list.has(entry);
        }

        // DO WE WANT TO DO THIS???
        if (!doesMatch) {
          continue;
        }
      }

      if (query.has) {
        for (let i = 0; i < query.has.length; i++) {
          const hasComponent = query.has[i];
          const list = this.ecs.componentListMap.get(hasComponent);

          if (!list) {
            doesMatch = false;
            continue;
          }

          const component = list.get(entry);

          if (!component) {
            doesMatch = false;
          } else {
            // @ts-ignore
            components.push(component as InstanceType<typeof hasComponent>);
          }
        }

        if (!doesMatch) {
          continue;
        }
      }

      cb(components);
    }
  }
}
