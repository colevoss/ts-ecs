import { Ecs } from "../ecs";
import { SystemRunnable } from "./types";

export class SystemRunner implements SystemRunnable {
  private systems: SystemRunnable[] = [];

  constructor() {}

  public addSystem(system: SystemRunnable): this {
    console.log("Adding system", system.getLabel());
    this.systems.push(system);
    return this;
  }

  public registerInWorld(): void {}

  public getLabel(): string {
    return "no label";
  }

  public run(ecs: Ecs): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].run(ecs);
    }
  }
}
