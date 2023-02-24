import { Ecs } from "../ecs";
import { Vertex } from "./system-vertex";

export interface ISystemBase {
  registerInWorld(ecs: Ecs): void;
}

export interface ISystemRunnable {
  run(ecs: Ecs): void;
}

export interface ISystemGroup extends ISystemBase, ISystemRunnable, Vertex {}
export interface ISystem extends ISystemBase, ISystemRunnable, Vertex {}

export class SystemGroup extends Vertex implements ISystemGroup {
  public registerInWorld(ecs: Ecs) {
    if (!this.edges.length) {
      return;
    }

    for (let i = 0; i < this.edges.length; i++) {
      this.edges[i].to.registerInWorld(ecs);
    }
  }

  public run(ecs: Ecs): void {
    if (!this.edges.length) {
      return;
    }

    for (let i = 0; i < this.edges.length; i++) {
      this.edges[i].to.run(ecs);
    }
  }
}
