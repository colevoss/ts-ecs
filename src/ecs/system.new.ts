import { SystemRunner } from "./system";

type SystemSetClass = {
  new (): SystemSet;
};

export class SystemSet {
  public name: SystemLabel;
  private systems: SystemRunner[] = [];

  constructor() {}

  public label(label: SystemLabel): this {
    this.name = label;
    return this;
  }

  public static new(this: SystemSetClass): SystemSet {
    return new this();
  }

  public withSystem(system: SystemRunner): this {
    this.systems.push(system);
    return this;
  }

  public withSystemAfter(system: SystemRunner, after: SystemRunner): this {
    const afterIndex = this.systems.indexOf(after);
    const beforeSystems = this.systems.slice(0, afterIndex);
    const afterSystems = this.systems.slice(
      afterIndex + 1,
      this.systems.length
    );

    this.systems = [...beforeSystems, system, ...afterSystems];

    return this;
  }

  public withSystemBefore(system: SystemRunner, before: SystemRunner): this {
    const beforeIndex = this.systems.indexOf(before);
    const beforeItems = this.systems.slice(0, beforeIndex);
    const afterItems = this.systems.slice(beforeIndex, this.systems.length);

    this.systems = [...beforeItems, system, ...afterItems];

    return this;
  }
}

export class OrderedMap<T> {
  private map: Map<string, T> = new Map();
  public keys: string[] = [];

  public add(key: string, value: T): this {
    this.keys.push(key);
    this.map.set(key, value);
    return this;
  }

  public get(key: string): T | undefined {
    return this.map.get(key);
  }

  public has(key: string): boolean {
    return this.map.has(key);
  }

  public remove(key: string): this {
    this.keys = this.keys.filter((k) => k !== key);
    this.map.delete(key);
    return this;
  }

  public addBefore(key: string, value: T, beforeKey: string): this {
    const beforeIndex = this.keys.indexOf(beforeKey);

    if (beforeIndex === -1) {
      return this;
    }

    const beforeItems = this.keys.slice(0, beforeIndex);
    const afterItems = this.keys.slice(beforeIndex, this.keys.length);

    this.keys = [...beforeItems, key, ...afterItems];
    this.add(key, value);
    return this;
  }

  public addAfter(key: string, value: T, afterKey: string): this {
    const afterIndex = this.keys.indexOf(afterKey);

    if (afterIndex === -1) {
      return this;
    }

    const beforeSystems = this.keys.slice(0, afterIndex);
    const afterSystems = this.keys.slice(afterIndex + 1, this.keys.length);

    this.keys = [...beforeSystems, key, ...afterSystems];
    this.add(key, value);
    return this;
  }

  public iter(): OrdererdMapIterator<T> {
    return new OrdererdMapIterator(this);
  }
}

class OrdererdMapIterator<T> {
  [Symbol.iterator]() {
    return this;
  }

  private ordererdMap: OrderedMap<T>;
  private index: number = 0;

  constructor(ordererdMap: OrderedMap<T>) {
    this.ordererdMap = ordererdMap;
  }

  next() {
    if (this.index === this.ordererdMap.keys.length) {
      return { value: null, done: true };
    }

    const key = this.ordererdMap.keys[this.index];
    const value = this.ordererdMap.get(key);

    if (!value) {
      return { done: true };
    }

    const result = [key, value, this.index];

    this.index += 1;

    return {
      value: result,
      done: false,
    };
  }
}

function test() {
  SystemSet.new().label("test");
}
