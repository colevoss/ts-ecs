import { Ecs, innerecs } from "../ecs";
import { EventClassTypeArr } from "../event";
import {
  ComponentQuery,
  ComponentTypeTuple,
  EventReaderQueryResults,
  EventWriterQueryResults,
  PartialQueryParams,
  ResourceQuery,
} from "../query";
import { SystemHandler, EntitySystemQuery, EntitySystemHandler } from "./types";
import { SystemGroup } from "./system-base";

export class System<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
> extends SystemGroup {
  public handler: SystemHandler<H, R, Ew, Er>;
  public query: PartialQueryParams<H, W, Wo, R, Ew, Er>;

  private eventWriters: EventWriterQueryResults<Ew>["eventWriters"] = [];
  private eventReaders: EventReaderQueryResults<Er>["eventReaders"] = [];

  constructor(
    query: PartialQueryParams<H, W, Wo, R, Ew, Er>,
    handler: SystemHandler<H, R, Ew, Er>
  ) {
    super();
    this.query = query;
    this.handler = handler;
  }

  public run(ecs: Ecs): void {
    const results = ecs.query.run(this.query);

    this.handler(
      Object.assign(results, {
        commands: ecs.commands,
        query: ecs.query,
        eventWriters: this.eventWriters,
        eventReaders: this.eventReaders,
      })
    );

    super.run(ecs);
  }

  public registerInWorld(ecs: Ecs): void {
    this.getEventWriters(ecs);
    this.getEventReaders(ecs);

    super.registerInWorld(ecs);
  }

  private getEventWriters(ecs: Ecs) {
    if (!this.query.eventWriter) {
      return;
    }

    const writers = [];
    for (const eventType of this.query.eventWriter) {
      const event = ecs[innerecs].eventMap.getEventByType(eventType);
      if (!event) {
        throw new Error("No event registered");
      }

      const writer = event.getNewWriter();
      writers.push(writer);
    }

    this.eventWriters = writers as EventWriterQueryResults<Ew>["eventWriters"];
  }

  private getEventReaders(ecs: Ecs) {
    if (!this.query.eventReader) {
      return;
    }

    const readers = [];

    for (const eventType of this.query.eventReader) {
      const event = ecs[innerecs].eventMap.getEventByType(eventType);

      if (!event) {
        throw new Error("No event registered");
      }

      const reader = event.registerReader();
      readers.push(reader);
    }

    this.eventReaders = readers as EventReaderQueryResults<Er>["eventReaders"];
  }

  public static init<
    H extends ComponentTypeTuple,
    W extends ComponentTypeTuple,
    Wo extends ComponentTypeTuple,
    R extends ComponentTypeTuple,
    Ew extends EventClassTypeArr,
    Er extends EventClassTypeArr
  >(
    query: PartialQueryParams<H, W, Wo, R, Ew, Er>,
    handler: SystemHandler<H, R, Ew, Er>
  ): System<H, W, Wo, R, Ew, Er> {
    return new System(query, handler);
  }
}

export class EntitySystem<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple
  // > extends ISystem {
> extends SystemGroup {
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
    const results = Object.assign(queryResults, {
      commands: ecs.commands,
      query: ecs.query,
    });

    ecs.query.componentQuery(this.componentQuery, (components) => {
      this.handler(components, results);
    });

    super.run(ecs);
  }

  public registerInWorld(ecs: Ecs): void {
    super.registerInWorld(ecs);
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
