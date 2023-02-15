import { Ecs, EntityBuilder } from "./ecs";
import { Entity } from "./entity";

export class Commands {
  private ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public entity(entity: Entity): EntityBuilder {
    return this.ecs.entity(entity);
  }

  public spawn(): EntityBuilder {
    return this.ecs.spawn();
  }
}
