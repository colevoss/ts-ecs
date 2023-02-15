import { Ecs } from "./ecs";

export type EventClassType<M> = {
  new (...args: any[]): Event<M>;
};

export type EventType<M> = typeof Event<M>;
export type EventClassTypeArr = EventType<unknown>[];
export type EventTypeTuple<E extends EventClassTypeArr> = [...E] | never[];

export type EventInstanceTuple<E extends EventClassTypeArr> =
  | [eventWriter<InstanceType<E[number]>>]
  | never[];

export type EventWriterGenerator<E extends EventClassTypeArr> = (
  ecs: Ecs
) => EventInstanceTuple<E>;

export function EventWriter<E extends EventClassTypeArr>(
  ...events: E
): EventWriterGenerator<E> {
  return (ecs: Ecs) => {
    const writers = [];
    for (const event of events) {
      const eventType = ecs.eventMap.get(event);

      if (!eventType) {
        throw new Error(`No event type exists for ${eventType}`);
      }

      const writer = new eventWriter(eventType);

      writers.push(writer);
    }

    return writers as [eventWriter<InstanceType<E[number]>>];
  };
}

type EventSendType<E extends Event<unknown>> = E["send"] extends (
  ...args: infer P
) => any
  ? P
  : never;

class eventWriter<E extends Event<unknown>> {
  private event: E;

  constructor(event: E) {
    this.event = event;
  }

  public send(...args: EventSendType<E>): void {
    // @ts-ignore
    this.event.send(...args);
  }
}

export class EventMap {
  eventMap: Map<typeof Event<unknown>, Event<unknown>> = new Map();

  public registerEventType<M>(event: Event<M>) {
    this.eventMap.set(event.constructor as typeof Event<M>, event);
    // this.eventMap.set(event, new event());
  }

  public get<M>(event: typeof Event<M>): Event<M> | undefined {
    return this.eventMap.get(event) as Event<M>;
  }
}

export abstract class Event<M> {
  private messages: Set<M> = new Set<M>();
  public consumers: Set<number> = new Set<number>();

  public send(message: M): this {
    console.log("got message", message);
    this.messages.add(message);

    return this;
  }

  public consume(): Set<M> {
    return this.messages;
  }
}
