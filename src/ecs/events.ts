import { Ecs } from "./ecs";

export type EventClassType<M> = {
  new (...args: any[]): Event<M>;
  // reserveReader(): number;
};

export type EventType<M> = typeof Event<M>;
export type EventClassTypeArr = EventType<unknown>[];
export type EventTypeTuple<E extends EventClassTypeArr> = [...E] | never[];

export type EventWriterInstanceTuple<E extends EventClassTypeArr> =
  | [eventWriter<InstanceType<E[number]>>]
  | never[];

export type EventReaderInstanceTuple<E extends EventClassTypeArr> =
  | [eventReader<InstanceType<E[number]>>]
  | never[];

export type EventSubscriberInstanceTuple<E extends EventClassTypeArr> =
  | [eventSubscriber<InstanceType<E[number]>>]
  | never[];

export type EventWriterGenerator<E extends EventClassTypeArr> = (
  ecs: Ecs
) => EventWriterInstanceTuple<E>;

export type EventReaderGenerator<E extends EventClassTypeArr> = (
  ecs: Ecs
) => EventReaderInstanceTuple<E>;

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

export function EventReader<E extends EventClassTypeArr>(
  ...events: E
): EventReaderGenerator<E> {
  const readerIds = events.map((e) => {
    return e.reserveReader();
  });

  return (ecs: Ecs) => {
    const readers = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const readerId = readerIds[i];
      const cachedReader = event.getReader(readerId);

      // Do not need to create new reader
      if (cachedReader) {
        readers.push(cachedReader);
        continue;
      }

      // console.log("Does not have cached reader.", readerId);

      // Create new reader and register with Event class
      const eventType = ecs.eventMap.get(event);

      if (!eventType) {
        throw new Error(`No event type exists for ${event}`);
      }

      const reader = new eventReader();
      event.fillReservation(readerId, reader);
      readers.push(reader);
    }

    return readers as [eventReader<InstanceType<E[number]>>];
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

type EventReaderSubscriber<M> = (message: M) => void;

export class eventReader<E extends Event<unknown>> {
  private messages: Set<unknown> = new Set();
  private subscribers: EventReaderSubscriber<unknown>[] = [];

  constructor() {}

  public read(): E["consume"] extends () => infer P ? P : never {
    // @ts-ignore
    const messages = [];

    this.messages.forEach((m) => {
      messages.push(m);
      this.messages.delete(m);
    });

    // @ts-ignore
    return messages as E["consume"] extends () => infer P ? P : never;
  }

  public send<M>(message: M) {
    this.messages.add(message);

    if (this.subscribers.length) {
      for (const sub of this.subscribers) {
        sub(message);
      }
    }
  }

  public subscribe(subscriber: EventReaderSubscriber<unknown>) {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers.filter((s) => s !== subscriber);
    };
  }
}

export type EventSubscriberGenerator<E extends EventClassTypeArr> = (
  ecs: Ecs
) => EventSubscriberInstanceTuple<E>;

export function EventSubscriber<E extends EventClassTypeArr>(
  ...events: E
): EventSubscriberGenerator<E> {
  return (ecs: Ecs) => {
    const subscribers = [];
    for (const event of events) {
      const eventType = ecs.eventMap.get(event);

      if (!eventType) {
        throw new Error(`No event type exists for ${eventType}`);
      }

      const subscriber = new eventSubscriber(eventType);
      event.registerSubscriber(subscriber);
      subscribers.push(subscriber);
    }

    return subscribers as [eventSubscriber<InstanceType<E[number]>>];
  };
}

type EventInnerType<E extends Event<unknown>> = E["send"] extends (
  // ...args: infer P
  args: infer P
) => any
  ? P
  : never;

type EventSubscriberHandler<E extends Event<unknown>> = (
  message: EventInnerType<E>
) => void;

export class eventSubscriber<E extends Event<unknown>> {
  private event: E;
  private subscriberHandler?: EventSubscriberHandler<E>;

  constructor(event: E) {
    this.event = event;
  }

  public send(message: EventInnerType<E>) {
    this.subscriberHandler && this.subscriberHandler(message);
  }

  public handler(handler: EventSubscriberHandler<E>) {
    this.subscriberHandler = handler;
  }

  public unsubscribe() {
    this.event.unsubscribe(this);
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

export abstract class Event<M = undefined> {
  private messages: Map<M, number> = new Map();
  public consumers: number = 0;

  private get readers(): Map<number, eventReader<this>> {
    // @ts-ignore
    return this.constructor.readers;
  }

  private get subscribers(): Set<eventSubscriber<this>> {
    // @ts-ignore
    return this.constructor.subscribers;
  }

  public unsubscribe(subscriber: eventSubscriber<Event<unknown>>) {
    // @ts-ignore
    this.constructor.unsubscribe(subscriber);
  }

  private static unsubscribe(subscriber: eventSubscriber<Event<unknown>>) {
    this.subscribers.delete(subscriber);
  }

  public send(message: M): this {
    this.subscribers.forEach((subscriber) => {
      subscriber.send(message);
    });

    this.readers.forEach((reader) => {
      reader.send(message);
    });

    return this;
  }

  public registerReader() {
    this.consumers += 1;
  }

  private clearMessage(message: M): boolean {
    if (!this.messages.has(message)) {
      return false;
    }

    this.messages.delete(message);
    return true;
  }

  public consume(): M[] {
    const messages: M[] = [];

    this.messages.forEach((count, message) => {
      if (count === 0) {
        this.clearMessage(message);
        return;
      }

      messages.push(message);
      this.messages.set(message, count - 1);
    });

    return messages;
  }

  private static readers: Map<number, eventReader<Event<unknown>>> = new Map();
  private static readerCount: number = 0;

  // private static subscribers: Set<eventSubscriber<Event<unknown>>> = new Set();
  public static subscribers: Set<eventSubscriber<Event<unknown>>> = new Set();

  public static registerSubscriber(
    subscriber: eventSubscriber<Event<unknown>>
  ) {
    this.subscribers.add(subscriber);
  }

  public static reserveReader(): number {
    this.readerCount = this.readerCount + 1;
    console.log("Reserving reader", this.readerCount);
    return this.readerCount;
  }

  public static getReader(
    readerId: number
  ): eventReader<Event<unknown>> | undefined {
    return this.readers.get(readerId);
  }

  public static fillReservation(
    readerId: number,
    reader: eventReader<Event<unknown>>
  ) {
    if (this.readers.has(readerId)) {
      return;
    }
    console.log("Filling reservation", readerId, reader);

    this.readers.set(readerId, reader);
  }
}
