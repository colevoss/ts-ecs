import { Commands, Ecs } from "./ecs";
import { Entity } from "./entity";
import { Query } from "./query";

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
  R extends ComponentTypeTuple
> {
  has: ComponentTuple<H>;
  with: ComponentTuple<W>;
  res: ComponentTuple<R>;
  without: ComponentTuple<Wo>;
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
  ...components: ComponentTupleInstances<QueryParams<C, [], [], []>["has"]>
];

export type QueryResults<
  C extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = {
  components: ComponentResults<C>;
  resources: ResourceTypeResult<R>;
  commands: Commands;
};

export type ComponentResults<H extends ComponentTypeTuple> =
  ComponentResult<H>[];

export type SystemHandlerFn<
  C extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = (results: QueryResults<C, R>) => void;

export type SystemFn<
  C extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = (
  query: QueryParams<C, W, Wo, R>,
  handler: SystemHandlerFn<C, R>
) => unknown;

export type SystemRunner = (ecs: Ecs) => void;

export function eagerSystem<
  C extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
>(
  query: Partial<QueryParams<C, W, Wo, R>>,
  handler: SystemHandlerFn<C, R>
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
  resources: QueryResults<never, R>["resources"];
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
  R
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
