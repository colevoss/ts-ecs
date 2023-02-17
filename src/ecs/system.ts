import { Ecs } from "./ecs";
import { Commands } from "./commands";
import { Entity } from "./entity";
import { Query } from "./query";
import {
  EventClassTypeArr,
  EventWriterInstanceTuple,
  EventWriterGenerator,
  EventReaderGenerator,
  EventReaderInstanceTuple,
} from "./events";

export type ComponentTupleInstances<T extends ComponentTypeTuple> = {
  [K in keyof T]: InstanceType<T[K]>;
};

export type ComponentType = {
  new (...args: any[]): {};
};

export type ComponentTypeTuple = ComponentType[];

export type ComponentTuple<T extends ComponentTypeTuple> = [...T] | never[];

export interface QueryParams<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> {
  has: ComponentTuple<H>;
  with: ComponentTuple<W>;
  res: ComponentTuple<R>;
  without: ComponentTuple<Wo>;
  eventWriter?: EventWriterGenerator<Ew>;
  eventReader?: EventReaderGenerator<Er>;
  // eventWriter?: EventTypeTuple<Ew>;
}

export const defaultQueryParams = {
  has: [],
  with: [],
  without: [],
  res: [],
};

export type ResourceTypeResult<R extends ComponentTypeTuple> = {
  [K in keyof R]: InstanceType<R[K]>;
};

export type ComponentResult<C extends ComponentTypeTuple> = [
  entity: Entity,
  // ...components: ComponentTupleInstances<QueryParams<C, [], [], []>["has"]>
  ...components: ComponentTupleInstances<
    QueryParams<C, [], [], [], [], []>["has"]
  >
];

export type QueryResults<
  C extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = {
  components: ComponentResults<C>;
  resources: ResourceTypeResult<R>;
  commands: Commands;
  eventWriters: EventWriterInstanceTuple<Ew>;
  eventReaders: EventReaderInstanceTuple<Er>;
};

export type ComponentResults<H extends ComponentTypeTuple> =
  ComponentResult<H>[];

export type SystemHandlerFn<
  C extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (results: QueryResults<C, R, Ew, Er>) => void;

export type SystemFn<
  C extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (
  query: QueryParams<C, W, Wo, R, Ew, Er>,
  handler: SystemHandlerFn<C, R, Ew, Er>
) => unknown;

export type SystemRunner = (ecs: Ecs) => void;

export function eagerSystem<
  C extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
>(
  query: Partial<QueryParams<C, W, Wo, R, Ew, Er>>,
  handler: SystemHandlerFn<C, R, Ew, Er>
): SystemRunner {
  const queryParams = {
    ...defaultQueryParams,
    ...query,
  };

  return function (ecs: Ecs) {
    const results = ecs.query.run(queryParams);
    handler(results);
  };
}

type LazySystemHandlerParams<R extends ComponentTypeTuple> = {
  resources: QueryResults<never, R, never, never>["resources"];
  query: Query;
  commands: Commands;
};

export type LazySystemHandlerFn<R extends ComponentTypeTuple> = (
  params: LazySystemHandlerParams<R>
) => void;

type LazyResourceQueryParams<R extends ComponentTypeTuple> = QueryParams<
  never,
  never,
  never,
  R,
  never,
  never
>["res"];

export function system<R extends ComponentTypeTuple>(
  handler: LazySystemHandlerFn<R>
): SystemRunner;
export function system<R extends ComponentTypeTuple>(
  query: LazyResourceQueryParams<R>,
  handler: LazySystemHandlerFn<R>
): SystemRunner;
export function system<R extends ComponentTypeTuple>(
  queryHandler: LazyResourceQueryParams<R> | LazySystemHandlerFn<R>,
  handler?: LazySystemHandlerFn<R>
): SystemRunner {
  let queryParams: LazyResourceQueryParams<R> = [];
  let systemHandler: LazySystemHandlerFn<R>;

  if (handler !== undefined) {
    systemHandler = handler;
    queryParams = queryHandler as LazyResourceQueryParams<R>;
  } else {
    systemHandler = queryHandler as LazySystemHandlerFn<R>;
  }

  return function (ecs: Ecs) {
    systemHandler({
      resources: ecs.query.resources(queryParams),
      query: ecs.query,
      commands: ecs.commands,
    });
  };
}

export type PerEntityHandlerParams<R extends ComponentTypeTuple> = {
  resources: QueryResults<never, R, never, never>["resources"];
  commands: Commands;
};

// export function eagerSystem<
//   C extends ComponentTypeTuple,
//   W extends ComponentTypeTuple,
//   Wo extends ComponentTypeTuple,
//   R extends ComponentTypeTuple
// >(
//   query: Partial<QueryParams<C, W, Wo, R>>,
//   handler: SystemHandlerFn<C, R>
// ): SystemRunner {
type EntitySystemHandler<
  C extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = (components: ComponentResult<C>, params: PerEntityHandlerParams<R>) => void;

export function entitySystem<
  C extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
>(
  query: Partial<QueryParams<C, W, Wo, R, Ew, Er>>,
  handler: EntitySystemHandler<C, R>
): SystemRunner {
  return (ecs: Ecs) => {
    ecs.query.runPerEntity(query, handler);
  };
}
