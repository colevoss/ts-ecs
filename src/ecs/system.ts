import { Commands, Ecs } from "./ecs";
import { Entity } from "./entity";

export type ComponentTupleInstances<T extends ComponentTypeTuple> = {
  [K in keyof T]: InstanceType<T[K]>;
};

export type ComponentType = {
  new (...args: any[]): {};
};

export type ComponentTypeTuple = ComponentType[];

export type Test<T extends ComponentTypeTuple> = [...T] | never[];

export interface QueryParams<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> {
  /* has: [...H]; */
  /* with: [...W]; */
  /* res: [...R]; */
  /* without: [...Wo]; */
  has: Test<H>;
  with: Test<W>;
  res: Test<R>;
  without: Test<Wo>;
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

export function system<
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

  return (ecs: Ecs) => {
    const results = ecs.query(queryParams);
    handler(results);
  };
}
