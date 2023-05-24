// import { Ecs } from "../ecs";
import { Ecs, innerecs } from "../ecs";
import { Entity } from "../entity";
import { EntityCommands, Unreserve } from "./entity-commands";

export interface Command {
  execute(ecs: Ecs): void;
}

export class Commands implements Command {
  private commands: Command[] = [];

  public addCommand(command: Command): this {
    this.commands.push(command);
    return this;
  }

  public execute(ecs: Ecs): void {
    for (let i = 0; i < this.commands.length; i++) {
      this.commands[i].execute(ecs);
    }

    this.commands = [];
  }

  public readonly ecs: Ecs;

  constructor(ecs: Ecs) {
    this.ecs = ecs;
  }

  public spawn<T>(component: T): EntityCommands;
  public spawn<T>(component?: T[]): EntityCommands;
  public spawn<T>(component?: T | T[]): EntityCommands {
    const entity = this.ecs[innerecs].allocator.preserve();
    const entityCommands = new EntityCommands(entity, this);
    entityCommands.commands.addCommand(new Unreserve(entity));

    if (!component) {
      return entityCommands;
    }

    entityCommands.insert(component);

    return entityCommands;
  }

  public entity(entity: Entity): EntityCommands {
    return new EntityCommands(entity, this);
  }
}
