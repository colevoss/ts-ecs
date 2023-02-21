import { createContext, useContext } from "react";
import { World } from "../fps-test";
import { ComponentTypeTuple, QueryParams } from "../ecs/query";
import { EventClassTypeArr } from "../ecs/events";

export const WorldContext = createContext(World);

export function useWorld() {
  return useContext(WorldContext);
}

export function useQuery<
  H extends ComponentTypeTuple,
  W extends ComponentTypeTuple,
  Wo extends ComponentTypeTuple,
  R extends ComponentTypeTuple,
  Ew extends EventClassTypeArr,
  Er extends EventClassTypeArr
>(query: Partial<QueryParams<H, W, Wo, R, Ew, Er>>) {
  const world = useWorld();

  return world.query.run(query);
}
