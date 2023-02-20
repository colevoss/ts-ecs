import { Component } from "../components";
import { Entity } from "../entity";

@Component()
export class Child {
  private childIndecies: Set<number> = new Set();

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
  private parentIndex?: number;

  constructor() {}

  public addParent(entity: Entity) {
    this.parentIndex = entity.index;
  }

  public removeParent(entity: Entity) {
    if (entity.index !== this.parentIndex) {
      return;
    }

    this.parentIndex = undefined;
  }
}
