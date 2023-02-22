export type EventType<M> = typeof Event<M>;
export type EventClassTypeArr = EventType<unknown>[];
export type EventTypeTuple<E extends EventClassTypeArr> = [...E] | never[];

export type EventWriterInstanceTuple<E extends EventClassTypeArr> =
  | [EventWriter<EventInnerType<InstanceType<E[number]>>>]
  | never[];

export type EventReaderInstanceTuple<E extends EventClassTypeArr> =
  | [EventReader<EventInnerType<InstanceType<E[number]>>>]
  | never[];

export type EventInnerType<E extends Event<unknown>> = E["send"] extends (
  message: infer P
) => any
  ? P
  : never;

export type EventSubscriberHandler<E extends Event<unknown>> = (
  message: EventInnerType<E>
) => void;

export abstract class Event<M> {
  private readers: Set<EventReader<M>> = new Set();
  // private handlers: EventSubscriberHandler<M>[] = [];
  private subscrbers: Set<EventSubscriber<M>> = new Set();

  public send(message: M) {
    // for (const handler of this.handlers) {
    //   handler(message);
    // }

    this.readers.forEach((reader) => reader.send(message));
  }

  public registerReader() {
    const eventReader = new EventReader<M>();

    this.readers.add(eventReader);
    return eventReader;
  }

  public getNewWriter(): EventWriter<M> {
    return new EventWriter(this);
  }

  public generateSubscriber(): EventSubscriber<M> {
    const subscriber = new EventSubscriber<M>();

    this.subscrbers.add(subscriber);
    return subscriber;
  }
}

export abstract class EmptyEvent extends Event<undefined> {
  public send(msg?: never) {
    super.send(msg);
  }
}

export class EventReader<M> {
  public messages: M[] = [];

  public send(message: M) {
    this.messages.push(message);
  }

  public read(): M[] {
    const consumed = this.messages;
    this.messages = [];

    return consumed;
  }
}

export class EventWriter<M> {
  private event: Event<M>;

  constructor(event: Event<M>) {
    this.event = event;
  }

  public send(message: M) {
    this.event.send(message);
  }
}

export class EventSubscriber<M> {
  handler?: EventSubscriberHandler<Event<M>>;

  public send(message: M) {
    if (!this.handler) {
      throw new Error("Handler not registered");
    }

    this.handler(message);
  }

  public subscribe(handler: EventSubscriberHandler<Event<M>>): this {
    this.handler = handler;
    return this;
  }
}

export class EventMap {
  private eventMap: Map<typeof Event<unknown>, Event<unknown>> = new Map();

  constructor() {}

  public registerEvent<M>(event: Event<M>) {
    this.eventMap.set(event.constructor as typeof Event<M>, event);
  }

  public getEventByType<M>(event: typeof Event<M>): Event<M> | undefined {
    return this.eventMap.get(event) as Event<M>;
  }
}
