import { Child, Parent } from "../builtin";
import { Ecs } from "../ecs";
import { Entity } from "../entity";
import { Command, Commands } from "./commands";

export class Insert<T> implements Command {
  constructor(private entity: Entity, private components: T[]) {}

  public execute(ecs: Ecs): void {
    for (const component of this.components) {
      ecs.insertComponentForEntity(this.entity, component);
    }
  }
}

export class Remove<T> implements Command {
  constructor(private entity: Entity, private components: T[]) {}

  public execute(ecs: Ecs): void {
    for (const component of this.components) {
      ecs.remove(this.entity, component);
    }
  }
}

export class Kill implements Command {
  constructor(private entity: Entity) {}

  public execute(ecs: Ecs): void {
    ecs.killEntity(this.entity);
  }
}

export class Destroy implements Command {
  constructor(private entity: Entity) {}

  public execute(ecs: Ecs): void {
    ecs.destroyEntity(this.entity);
  }
}

export class EntityCommands {
  private entity: Entity;
  public readonly commands: Commands;

  constructor(entity: Entity, commands: Commands) {
    this.entity = entity;
    this.commands = commands;
  }

  public id(): Entity {
    return this.entity;
  }

  public insert<T>(component: T): this;
  public insert<T>(component: T[]): this;
  public insert<T>(component: T | T[]): this {
    const components: T[] = Array.isArray(component) ? component : [component];

    const insert = new Insert(this.entity, components);

    this.commands.addCommand(insert);

    return this;
  }

  public remove<T>(component: T): this;
  public remove<T>(component: T[]): this;
  public remove<T>(component: T | T[]): this {
    const components = Array.isArray(component) ? component : [component];

    const remove = new Remove(this.entity, components);

    this.commands.addCommand(remove);

    return this;
  }

  public kill(): this {
    this.commands.addCommand(new Kill(this.entity));
    return this;
  }

  public destroy(): this {
    this.commands.addCommand(new Destroy(this.entity));
    return this;
  }

  public withChildren(cb: (parent: ChildCommands) => void): this {
    const childCommands = new ChildCommands(this);
    cb(childCommands);
    return this;
  }

  public getParentEntity(parent: Parent): EntityCommands | undefined {
    const entity = this.commands.ecs.getEntityById(parent.parentEntityId);

    if (!entity) {
      return;
    }

    return new EntityCommands(entity, this.commands);
  }

  public getChildEntities(child: Child): EntityCommands[] {
    const entities: EntityCommands[] = [];

    child.childIndecies.forEach((entityId) => {
      const entity = this.commands.ecs.getEntityById(entityId);
      if (entity) {
        entities.push(new EntityCommands(entity, this.commands));
      }
    });

    return entities;
  }
}

export class ChildCommands {
  constructor(private parent: EntityCommands) {}

  public spawn() {
    const entity = this.parent.commands.spawn();
    const commands = new EntityCommands(entity.id(), this.parent.commands);

    commands.insert(new Parent(this.parent.id()));

    const childComponentMap =
      this.parent.commands.ecs.componentListMap.getOrCreate<Child>(Child);

    if (!childComponentMap) {
      throw Error("No child map wtf");
    }

    const childComponent =
      childComponentMap?.get(this.parent.id()) || new Child();

    childComponent.addChild(entity.id());
    this.parent.insert(childComponent);

    return commands;
  }
}
