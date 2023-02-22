import { Ecs } from "../ecs";
import { Entity } from "../entity";
import { EntityCommands } from "./entity-commands";

export interface Command {
  execute(ecs: Ecs): void;
}

export class CommandBuffer implements Command {
  private commands: Command[] = [];

  public addCommand(command: Command): this {
    this.commands.push(command);

    return this;
  }

  public execute(ecs: Ecs) {
    for (let i = 0; i < this.commands.length; i++) {
      this.commands[i].execute(ecs);
    }

    this.commands = [];
  }
}

export class Commands extends CommandBuffer {
  public readonly ecs: Ecs;

  constructor(ecs: Ecs) {
    super();
    this.ecs = ecs;
  }

  public spawn<T>(component: T): EntityCommands;
  public spawn<T>(component?: T[]): EntityCommands;
  public spawn<T>(component?: T | T[]): EntityCommands {
    const entity = this.ecs.allocator.allocate();
    const entityCommands = new EntityCommands(entity, this);

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
