import { Ecs } from "./ecs";
import { Child, Parent } from "./builtin";
import { Entity } from "./entity";

export class EntityBuilder {
  private entity: Entity;
  private ecs: Ecs;

  constructor(ecs: Ecs, entity: Entity) {
    this.ecs = ecs;
    this.entity = entity;
  }

  public insert<T>(component: T): this;
  public insert<T>(component: T[]): this;
  public insert<T>(component: T[] | T): this {
    const components: T[] = Array.isArray(component) ? component : [component];

    for (const comp of components) {
      this.ecs.insertComponentForEntity(this.entity, comp);
    }

    return this;
  }

  public remove<T>(component: T): EntityBuilder {
    this.ecs.remove(this.entity, component);
    return this;
  }

  public destroy(): boolean {
    return this.ecs.destroyEntity(this.entity);
  }

  public kill(): boolean {
    return this.ecs.killEntity(this.entity);
  }

  /**
   * TODO: Update Query to be able to query one entity at a time.
   * TODO: Update commands and entity builder to be better.
   * Cannot spawn parent component on child entity as it is now
   */
  public addChild(entity: Entity): this {
    // const childComponent = new Child()
    const componentMap = this.ecs.componentListMap.getOrCreate<Child>(Child);

    if (!componentMap) {
      throw new Error("NOPE");
    }

    const childComponent = componentMap?.get(this.entity) || new Child();
    childComponent.addChild(entity);
    this.ecs.insertComponentForEntity(this.entity, childComponent);

    const parentComponent = new Parent();
    parentComponent.addParent(this.entity);
    this.ecs.insertComponentForEntity(entity, parentComponent);

    return this;
  }
}
