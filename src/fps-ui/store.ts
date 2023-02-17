import { useSyncExternalStore } from "react";
import { Ecs } from "../ecs";
import { useWorld } from "./world-context";

type EventStoreSubscriber = () => void;

export abstract class EventStore<M> {
  private subscribers: EventStoreSubscriber[] = [];
  private isInitialized: boolean = false;

  abstract getSnapshot(): M;

  public subscribe = (listener: EventStoreSubscriber) => {
    this.subscribers = [...this.subscribers, listener];

    return () => {
      console.log("calling unsub");
      this.subscribers = this.subscribers.filter((l) => l !== listener);
    };
  };

  public emitChanges() {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  }

  public initialize(ecs: Ecs) {
    if (this.isInitialized) {
      return;
    }

    this.init(ecs);

    this.isInitialized = true;
  }

  public abstract init(ecs: Ecs): void;
}

export function useEventStore<M>(store: EventStore<M>) {
  const world = useWorld();
  store.initialize(world);
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
