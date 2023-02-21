import { Ecs } from "./ecs";
import { EntityBuilder } from "./entity-builder";
import { Entity } from "./entity";
import { Child, Parent } from "./builtin";

export class Commands {
  private ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public entity(entity: Entity): EntityBuilder {
    return this.ecs.entity(entity);
  }

  public getEntityById(id: number): Entity | undefined {
    return this.ecs.getEntityById(id);
  }

  public getChildEntities(child: Child): Entity[] {
    const entities: Entity[] = [];
    child.childIndecies.forEach((id) => {
      const entity = this.getEntityById(id);

      if (entity) {
        entities.push(entity);
      }
    });

    return entities;
  }

  public getParentEntity(parent: Parent): Entity | undefined {
    return this.getEntityById(parent.parentEntityId);
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
