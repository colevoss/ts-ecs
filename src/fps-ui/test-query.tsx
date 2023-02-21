import { Ecs } from "../ecs";
// import { eventStore } from "./test-store";
import { EventSubscriber } from "../ecs/events";
import { ShootEvent } from "../fps-test";
import { Projectile } from "../fps-test/projectile";
import { useEventStore, EventStore } from "./store";

class TestStore extends EventStore<number[]> {
  public messages: number[] = [];

  public init(ecs: Ecs): void {
    const [sub] = EventSubscriber(ShootEvent)(ecs);

    sub.handler((message) => {
      const { components } = ecs.query.run({ has: [Projectile] });
      this.messages = components.map(([entity]) => {
        return entity.index;
      });

      // this.messages += 1;
      this.emitChanges();
    });
  }

  public getSnapshot = (): number[] => {
    return this.messages;
  };
}

const myTestStore = new TestStore();

export function TestQuery() {
  const store = useEventStore(myTestStore);

  return (
    <div>
      {store.map((entityIndx) => {
        return <p>Bullet: {entityIndx}</p>;
      })}
    </div>
  );
}
