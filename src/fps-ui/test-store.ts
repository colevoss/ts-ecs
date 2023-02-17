import { EventReader } from "../ecs/events";
import { World, MyEvent } from "../fps-test";
import { Player } from "../fps-test/player";
import { Projectile } from "../fps-test/projectile";

let messages: number = 0;
let listeners: (() => void)[] = [];
let hasInitialized = false;

export const eventStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getSnapshot() {
    return messages;
  },

  init() {
    if (hasInitialized) {
      return;
    }

    const [eventReader] = EventReader(MyEvent)(World);
    eventReader.subscribe((x) => {
      const [player] = World.newQuery.run({ res: [Player] }).resources;
      messages = player.shotsFired;
      // messages.push(x as string);
      emitChange();
    });
    hasInitialized = true;
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}
