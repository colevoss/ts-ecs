import { TwoDee } from "./canvas";
import { System, SystemGroup } from "../ecs";

const clearCanvasSystem = System.init(
  { res: [TwoDee] },
  function clearCanvas({ resources }) {
    const [scene] = resources;

    scene.clear();
  }
);

export const RenderGroup = new SystemGroup();

RenderGroup.add(clearCanvasSystem);
