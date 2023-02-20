import { Ecs } from "./ecs";
import { EntityBuilder } from "./entity-builder";
import { Entity } from "./entity";

export class Commands {
  private ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public entity(entity: Entity): EntityBuilder {
    return this.ecs.entity(entity);
  }

  public spawn<T>(component?: T): EntityBuilder;
  public spawn<T>(component?: T[]): EntityBuilder;
  public spawn<T>(component?: T | T[]): EntityBuilder {
    const entityBuilder = this.ecs.spawn();

    if (!component) {
      return entityBuilder;
    }

    const components = Array.isArray(component) ? component : [component];

    entityBuilder.insert(components);

    return entityBuilder;
  }
}
