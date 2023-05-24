// import { Entity } from "./entity";

class TestEntity {
  index: number;
  alive: boolean;

  constructor(i: number) {
    this.index = i;
    this.alive = true;
  }

  kill() {
    this.alive = false;
  }

  isAlive(): boolean {
    return this.alive;
  }
}

export class EntityManger {
  public entities: TestEntity[] = [];
  #size: number = 0;
  #nextSize: number = 0;

  public get size() {
    return this.#size;
  }

  public allocate() {
    let entity = this.entities[this.#nextSize];

    if (entity && !entity.isAlive) {
      entity.alive = true;
    } else {
      entity = new TestEntity(this.#nextSize);
      this.entities.push(entity);
    }

    this.#nextSize += 1;

    return entity;
  }

  public update() {
    const newSize = this.refresh();

    this.#size = newSize;
    this.#nextSize = newSize;
  }

  private refresh(): number {
    let d = 0;
    // let a = this.entities.length - 1;
    let a = this.#nextSize - 1;

    while (true) {
      // Move left to right and find a false
      for (; ; d++) {
        if (d > a) {
          return d;
        }

        if (!this.entities[d].alive) {
          break;
        }
      }

      // Move right to left and find a true
      for (; ; a--) {
        if (this.entities[a].alive) {
          break;
        }

        if (a <= d) {
          return d;
        }
      }

      if (d > a) {
        break;
      }

      // console.log(`Swapping ${d} with ${a}`)

      const dead = this.entities[d];
      this.entities[d] = this.entities[a];
      this.entities[a] = dead;

      a--;
      d++;
    }

    return d;
  }

  public kill(ent: TestEntity) {
    ent.kill();
  }
}
