import { Ecs } from "./ecs";
import {
  ComponentResult,
  ComponentResults,
  ComponentTypeTuple,
  QueryParams,
  ResourceTypeResult,
} from "./system";

export const defaultQueryParams = {
  has: [],
  with: [],
  without: [],
  res: [],
};

export class Query {
  private ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public resources<R extends ComponentTypeTuple>(
    resQuery: QueryParams<never, never, never, R>["res"]
  ) {
    const resources = [];

    for (let i = 0; i < resQuery.length; i++) {
      resources.push(this.ecs.resources.getResource(resQuery[i]));
    }

    return resources as ResourceTypeResult<R>;
  }

  public run<
    C extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple
  >(_query: Partial<QueryParams<C, W, Wo, R>>) {
    const query = {
      ...defaultQueryParams,
      ..._query,
    };

    const resources = this.resources(query.res);

    const componentResult: ComponentResults<C> = [];

    for (let i = 0; i < this.ecs.allocator.entities.length; i++) {
      const entry = this.ecs.allocator.entities[i];
      const components = [entry] as unknown as ComponentResults<C>;

      let doesMatch = true;

      if (query.without.length > 0) {
        for (let i = 0; i < query.without[i].length; i++) {
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

      if (query.with.length) {
        for (let i = 0; i < query.with.length; i++) {
          const withQueryComponent = query.with[i];
          const list =
            this.ecs.componentListMap.get<typeof withQueryComponent>(
              withQueryComponent
            );

          if (!list) {
            doesMatch = false;
            continue;
          }

          doesMatch = list.has(entry);
        }
      }

      if (query.has.length) {
        for (let i = 0; i < query.has.length; i++) {
          const hasQueryComponent = query.has[i];
          const list =
            this.ecs.componentListMap.get<typeof hasQueryComponent>(
              hasQueryComponent
            );

          if (!list) {
            doesMatch = false;
            continue;
          }

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

        componentResult.push(components as ComponentResult<C>);
      }
    }

    return {
      components: componentResult,
      resources: resources,
      commands: this.ecs.commands,
    };
  }
}
