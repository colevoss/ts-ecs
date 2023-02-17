import { Commands } from "../commands";
import { Entity } from "../entity";
import {
  EventClassTypeArr,
  EventReaderGenerator,
  EventReaderInstanceTuple,
  EventWriterGenerator,
  EventWriterInstanceTuple,
} from "../events";
import { Query } from "./query";

export type ComponentTupleInstances<T extends ComponentTypeTuple> = {
  [K in keyof T]: InstanceType<T[K]>;
};

export type ComponentType = {
  new (...args: any[]): {};
};

export type ComponentTypeTuple = ComponentType[];

export type ComponentTuple<T extends ComponentTypeTuple> = [...T] | never[];

export type HasQuery<H extends ComponentTypeTuple> = {
  has: ComponentTuple<H>;
};

export type WithQuery<W extends ComponentTypeTuple> = {
  with: ComponentTuple<W>;
};

export type WithoutQuery<Wo extends ComponentTypeTuple> = {
  without: ComponentTuple<Wo>;
};

export type ComponentQuery<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple
> = HasQuery<H> & WithQuery<W> & WithoutQuery<Wo>;

export type ResourceQuery<R extends ComponentTypeTuple> = {
  res: ComponentTuple<R>;
};

export type EventWriterQuery<Ew extends EventClassTypeArr> = {
  eventWriter: EventWriterGenerator<Ew>;
};

export type EventReaderQuery<Er extends EventClassTypeArr> = {
  eventReader: EventReaderGenerator<Er>;
};

export type QueryParams<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = HasQuery<H> &
  WithQuery<W> &
  WithoutQuery<Wo> &
  ResourceQuery<R> &
  EventWriterQuery<Ew> &
  EventReaderQuery<Er>;

export type PartialQueryParams<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = Partial<QueryParams<H, W, Wo, R, Ew, Er>>;

export type ResourceTypeResult<R extends ComponentTypeTuple> = {
  [K in keyof R]: InstanceType<R[K]>;
};

export type ComponentResult<C extends ComponentTypeTuple> = [
  entity: Entity,
  ...components: ComponentTupleInstances<HasQuery<C>["has"]>
];

export type ComponentResults<C extends ComponentTypeTuple> =
  ComponentResult<C>[];

export type ComponentQueryResults<C extends ComponentTypeTuple> = {
  components: ComponentResults<C>;
};

export type ResourceQueryResults<R extends ComponentTypeTuple> = {
  resources: ResourceTypeResult<R>;
};

export type EventWriterQueryResults<Ew extends EventClassTypeArr> = {
  eventWriters: EventWriterInstanceTuple<Ew>;
};

export type EventReaderQueryResults<Er extends EventClassTypeArr> = {
  eventReaders: EventReaderInstanceTuple<Er>;
};

export type CommandQueryResults = {
  commands: Commands;
};

export type QueryQueryResults = {
  query: Query;
};

export type BaseQueryResults<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = ComponentQueryResults<H> &
  ResourceQueryResults<R> &
  EventWriterQueryResults<Ew> &
  EventReaderQueryResults<Er> &
  CommandQueryResults;

export type EagerQueryResults<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = BaseQueryResults<H, R, Ew, Er>;

export type LazyQueryResults<
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = ResourceQueryResults<R> &
  EventWriterQueryResults<Ew> &
  EventReaderQueryResults<Er> &
  CommandQueryResults &
  QueryQueryResults;
