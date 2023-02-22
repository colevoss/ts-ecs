import { Ecs, eventSubscriber } from "../ecs";
// import { eventStore } from "./test-store";
import { ShootEvent, MyEvent } from "../fps-test";
import { Projectile } from "../fps-test/projectile";
import { useEventStore, EventStore } from "./store";

class TestStore extends EventStore<number[]> {
  public init(ecs: Ecs): void {
    ecs.eventSubscriber(ShootEvent).subscribe(() => {
      const { components } = ecs.query.run({ has: [Projectile] });

      this.set(() => {
        return components.map(([entity]) => {
          return entity.index;
        });
      });
    });
  }
}

const myTestStore = new TestStore([]);

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
