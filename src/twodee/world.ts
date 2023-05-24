import { Ecs, TimePlugin } from "../ecs";

export const World = new Ecs();
World.addPlugin(new TimePlugin());
// World.addPlugin(new StatsPlugin());
