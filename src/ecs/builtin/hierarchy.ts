import { Component } from "../component";
import { Entity } from "../entity";

@Component()
export class Child {
  public readonly childIndecies: Set<number> = new Set();

  constructor() {}

  public addChild(entity: Entity) {
    this.childIndecies.add(entity.index);
  }

  public remove(entity: Entity) {
    this.childIndecies.delete(entity.index);
  }
}

@Component()
export class Parent {
  private parentIndex: number;

  constructor(parent: Entity) {
    this.parentIndex = parent.index;
  }

  // public addParent(entity: Entity) {
  //   this.parentIndex = entity.index;
  // }

  public removeParent(entity: Entity) {
    if (entity.index !== this.parentIndex) {
      return;
    }

    // this.parentIndex = undefined;
  }

  public get parentEntityId(): number {
    return this.parentIndex;
  }
}
