import { Ecs } from "./ecs";

export interface Plugin {
  build(ecs: Ecs): void;
}
