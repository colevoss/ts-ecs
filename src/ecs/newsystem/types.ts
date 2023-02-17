import { Ecs } from "../ecs";
import { EventClassTypeArr } from "../events";
import {
  CommandQueryResults,
  ComponentQuery,
  ComponentResult,
  ComponentTypeTuple,
  EagerQueryResults,
  EventReaderQuery,
  EventWriterQuery,
  LazyQueryResults,
  ResourceQuery,
  ResourceQueryResults,
} from "../newquery";
import { SystemLabel } from "./system";

export type EagerSystemHandler<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (results: EagerQueryResults<H, R, Ew, Er>) => void;

export type LazySystemQuery<
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = ResourceQuery<R> & EventWriterQuery<Ew> & EventReaderQuery<Er>;

export type LazySystemHandler<
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (results: LazyQueryResults<R, Ew, Er>) => void;

export type EntitySystemQuery<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = ComponentQuery<H, W, Wo> & ResourceQuery<R>;

export type EntitySystemQueryResults<R extends ComponentTypeTuple> =
  ResourceQueryResults<R> & CommandQueryResults;

export type EntitySystemHandler<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple
> = (
  components: ComponentResult<H>,
  queryResults: EntitySystemQueryResults<R>
) => void;

export interface SystemRunnable {
  run(ecs: Ecs): void;
  getLabel(): SystemLabel;
}
