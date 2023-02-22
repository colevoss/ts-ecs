import { Ecs } from "../ecs";
import { EventClassTypeArr } from "../event";
import {
  BaseQueryResults,
  CommandQueryResults,
  ComponentQuery,
  ComponentResult,
  ComponentTypeTuple,
  EagerQueryResults,
  EventReaderQuery,
  EventWriterQuery,
  ResourceQuery,
  ResourceQueryResults,
} from "../query";
import { SystemLabel } from "./system";

export type EagerSystemHandler<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (results: EagerQueryResults<H, R, Ew, Er>) => void;

export type SystemQuery<
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = ResourceQuery<R> & EventWriterQuery<Ew> & EventReaderQuery<Er>;

export type SystemHandler<
  H extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> = (results: BaseQueryResults<H, R, Ew, Er>) => void;

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
  registerInWorld(ecs: Ecs): void;
  getLabel(): SystemLabel;
}
