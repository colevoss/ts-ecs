import { Ecs } from "../ecs";
import { EventClassTypeArr } from "../events";
import {
  ComponentQuery,
  ComponentTypeTuple,
  PartialQueryParams,
  ResourceQuery,
} from "../query";
import {
  EagerSystemHandler,
  LazySystemQuery,
  LazySystemHandler,
  SystemRunnable,
  EntitySystemQuery,
  EntitySystemHandler,
} from "./types";

export type SystemLabel = string;

export function Systemlabel(label: string): SystemLabel {
  return label;
}

let SYSTEM_LABEL = 0;
function newSystemLabel() {
  const systemLabel = SYSTEM_LABEL.toString();
  SYSTEM_LABEL += 1;
  return systemLabel;
}

type AbstractClass = {
  new (...args: any[]): any;
};

type Class<C extends AbstractClass> = {
  new (...args: ConstructorParameters<C>): InstanceType<C>;
};

export abstract class ISystem implements SystemRunnable {
  private systemLabel: SystemLabel;

  constructor() {
    this.systemLabel = newSystemLabel();
  }

  public getLabel(): SystemLabel {
    return this.systemLabel;
  }

  public label(label: SystemLabel): this {
    this.systemLabel = label;
    return this;
  }

  public abstract run(ecs: Ecs): void;
}

export class EagerSystem<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> extends ISystem {
  public query: PartialQueryParams<H, W, Wo, R, Ew, Er>;
  public handler: EagerSystemHandler<H, R, Ew, Er>;

  constructor(
    query: PartialQueryParams<H, W, Wo, R, Ew, Er>,
    handler: EagerSystemHandler<H, R, Ew, Er>
  ) {
    super();
    this.query = query;
    this.handler = handler;
  }

  public run(ecs: Ecs) {
    const results = ecs.query.run(this.query);
    return this.handler(results);
  }

  public static init<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple,
    Ew extends EventClassTypeArr,
    Er extends EventClassTypeArr
  >(
    this: Class<typeof EagerSystem>,
    query: PartialQueryParams<H, W, Wo, R, Ew, Er>,
    handler: EagerSystemHandler<H, R, Ew, Er>
  ): EagerSystem<H, W, Wo, R, Ew, Er> {
    return new EagerSystem(query, handler);
  }
}

export class LazySystem<
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> extends ISystem {
  public handler: LazySystemHandler<R, Ew, Er>;
  public query: Partial<LazySystemQuery<R, Ew, Er>>;

  constructor(
    query: Partial<LazySystemQuery<R, Ew, Er>>,
    handler: LazySystemHandler<R, Ew, Er>
  ) {
    super();
    this.query = query;
    this.handler = handler;
  }

  public run(ecs: Ecs): void {
    // const { commands, resources, eventWriters, eventReaders } =
    //   ecs.newQuery.run(this.query);

    const results = ecs.query.run(this.query);

    this.handler({
      resources: results.resources,
      eventWriters: results.eventWriters,
      eventReaders: results.eventReaders,
      query: ecs.query,
      commands: ecs.commands,
    });
  }

  public static init<
    R extends ComponentTypeTuple,
    Ew extends EventClassTypeArr,
    Er extends EventClassTypeArr
  >(
    query: Partial<LazySystemQuery<R, Ew, Er>>,
    handler: LazySystemHandler<R, Ew, Er>
  ): LazySystem<R, Ew, Er> {
    return new LazySystem(query, handler);
  }
}

export class EntitySystem<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> extends ISystem {
  private query: Partial<EntitySystemQuery<H, W, Wo, R>>;
  private handler: EntitySystemHandler<H, R>;
  private resQuery: Partial<ResourceQuery<R>>;
  private componentQuery: Partial<ComponentQuery<H, W, Wo>>;

  constructor(
    query: Partial<EntitySystemQuery<H, W, Wo, R>>,
    handler: EntitySystemHandler<H, R>
  ) {
    super();
    this.query = query;
    const { res, ...componentQuery } = this.query;
    this.resQuery = {
      res,
    };
    this.componentQuery = componentQuery;

    this.handler = handler;
  }

  public run(ecs: Ecs): void {
    const queryResults = ecs.query.run(this.resQuery);

    ecs.query.componentQuery(this.componentQuery, (components) => {
      this.handler(components, queryResults);
    });
  }

  public static init<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple
  >(
    query: Partial<EntitySystemQuery<H, W, Wo, R>>,
    handler: EntitySystemHandler<H, R>
  ): EntitySystem<H, W, Wo, R> {
    return new EntitySystem(query, handler);
  }
}

// class Test {}
// class CompTest {}
// //
// LazySystem.init({ res: [Test] }, function ({ resources, query }) {
//   const [test] = resources;
//   const { components } = query.run({ has: [CompTest] });
//
//   for (const [e, compTest] of components) {
//   }
// });
//
// EagerSystem.init(
//   { has: [CompTest], res: [Test] },
//   function ({ resources, components, commands }) {
//     const [test] = resources;
//
//     for (const [e, compTest] of components) {
//     }
//   }
// );
//
// EntitySystem.init(
//   { has: [CompTest], res: [Test] },
//   function (components, { resources, commands }) {
//     const [e, comp] = components;
//   }
// );
