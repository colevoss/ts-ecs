import { Ecs } from "../ecs";
import { SystemLabel } from "./system-label";
import { SystemRunnable } from "./types";

enum SystemOrderer {
  Before = "Before",
  After = "After",
}

export type SystemAfter = {
  order: SystemOrderer.After;
  label: SystemLabel;
};

export function After(label: SystemLabel): SystemAfter {
  return {
    order: SystemOrderer.After,
    label,
  };
}

export type SystemBefore = {
  order: SystemOrderer.Before;
  label: SystemLabel;
};

export function Before(label: SystemLabel): SystemBefore {
  return {
    order: SystemOrderer.Before,
    label,
  };
}

export type SystemOrder = SystemBefore | SystemAfter;

export function isBefore(order: SystemOrder): order is SystemBefore {
  return order.order === SystemOrderer.Before;
}

export function isAfter(order: SystemOrder): order is SystemAfter {
  return order.order === SystemOrderer.After;
}

export interface ISystemSet {
  addSystem(runner: SystemRunnable, order?: SystemOrder): this;
}

// export class SystemSet implements ISystemSet, SystemRunnable {
//   private systems: SystemRunnable[] = [];
//
//   public addSystem(system: SystemRunnable, order?: SystemOrder): this {
//     if (!order) {
//       this.systems.push(system);
//       return this;
//     }
//
//     if (isBefore(order)) {
//       // do before stuff
//       return this;
//     }
//
//     if (isAfter(order)) {
//       // do after stuff
//       return this;
//     }
//
//     return this;
//   }
//
//   public run(ecs: Ecs): void {
//     for (let i = 0; i < this.systems.length; i++) {
//       this.systems[i].run(ecs);
//     }
//   }
//
//   registerInWorld(ecs: Ecs): void {
//     throw new Error("Method not implemented.");
//   }
//
//   getLabel() {
//     throw new Error("Method not implemented.");
//   }
// }
