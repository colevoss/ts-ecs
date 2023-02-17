import { Ecs } from "./ecs";
import {
  EventClassTypeArr,
  EventReaderInstanceTuple,
  EventWriterInstanceTuple,
} from "./events";
import {
  ComponentResult,
  ComponentResults,
  ComponentTypeTuple,
  QueryParams,
  ResourceTypeResult,
  PerEntityHandlerParams,
  QueryResults,
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
    resQuery: QueryParams<never, never, never, R, never, never>["res"]
  ) {
    const resources = [];

    for (let i = 0; i < resQuery.length; i++) {
      resources.push(this.ecs.resources.getResource(resQuery[i]));
    }

    return resources as ResourceTypeResult<R>;
  }

  public runPerEntity<
    C extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple,
    Ew extends EventClassTypeArr,
    Er extends EventClassTypeArr
  >(
    query: Partial<QueryParams<C, W, Wo, R, Ew, Er>>,
    cb: (
      components: ComponentResult<C>,
      otherStuff: PerEntityHandlerParams<R>
    ) => void
  ) {
    const fullQuery = {
      ...defaultQueryParams,
      ...query,
    };

    const resources = this.resources(fullQuery.res);
    const otherParams = {
      resources,
      commands: this.ecs.commands,
    };

    for (let i = this.ecs.allocator.entities.length - 1; i >= 0; i--) {
      const entry = this.ecs.allocator.entities[i];

      if (!entry.isLive) {
        continue;
      }

      const components = [entry] as unknown as ComponentResult<C>;

      let doesMatch = true;

      if (fullQuery.without.length > 0) {
        for (let i = 0; i < fullQuery.without[i].length; i++) {
          const withoutQueryComponent = fullQuery.without[i];
          const list = this.ecs.componentListMap.get<
            typeof withoutQueryComponent
          >(withoutQueryComponent);

          if (!list) {
            continue;
          }

          doesMatch = !list.has(entry);
        } // without loop

        if (!doesMatch) {
          continue;
        }
      }

      if (fullQuery.with.length) {
        for (let i = 0; i < fullQuery.with.length; i++) {
          const withQueryComponent = fullQuery.with[i];
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

      if (fullQuery.has.length) {
        for (let i = 0; i < fullQuery.has.length; i++) {
          const hasQueryComponent = fullQuery.has[i];
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
        //
        // componentResult.push(components as ComponentResult<C>);
      }

      cb(components, otherParams);
    }
  }

  public run<
    C extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple,
    Ew extends EventClassTypeArr,
    Er extends EventClassTypeArr
  >(
    query: Partial<QueryParams<C, W, Wo, R, Ew, Er>>
  ): QueryResults<C, R, Ew, Er> {
    const fullQuery = {
      ...defaultQueryParams,
      ...query,
    };

    const resources = this.resources(fullQuery.res);

    const componentResult: ComponentResults<C> = [];

    let eventWriters: EventWriterInstanceTuple<Ew> = [];

    if (query.eventWriter) {
      eventWriters = query.eventWriter(this.ecs);
    }

    let eventReaders: EventReaderInstanceTuple<Er> = [];

    if (query.eventReader) {
      eventReaders = query.eventReader(this.ecs);
    }

    for (let i = 0; i < this.ecs.allocator.entities.length; i++) {
      const entry = this.ecs.allocator.entities[i];
      const components = [entry] as unknown as ComponentResult<C>;

      let doesMatch = true;

      if (fullQuery.without.length > 0) {
        for (let i = 0; i < fullQuery.without[i].length; i++) {
          const withoutQueryComponent = fullQuery.without[i];
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

      if (fullQuery.with.length) {
        for (let i = 0; i < fullQuery.with.length; i++) {
          const withQueryComponent = fullQuery.with[i];
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

      if (fullQuery.has.length) {
        for (let i = 0; i < fullQuery.has.length; i++) {
          const hasQueryComponent = fullQuery.has[i];
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
      eventWriters,
      eventReaders,
    } as QueryResults<C, R, Ew, Er>;
  }
}
