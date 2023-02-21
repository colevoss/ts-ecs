import { Ecs, Plugin } from "./ecs";
import { LazySystem } from "./ecs/system";

export class StatsPlugin implements Plugin {
  public build(ecs: Ecs): void {
    const stats = new Stats();
    ecs.registerResource(stats);
    ecs.addSystem(statSystem);
    stats.startStats();

    setInterval(() => {
      console.log("FPS:", stats.fps());
    }, 1000);
  }
}

export class Stats {
  public fpsBufferLength;
  public fpsBuffer: number[] = [];
  public start: number = 0;
  public lastIndex: number = 0;

  constructor(bufferLength: number = 10) {
    this.fpsBufferLength = bufferLength;
    this.fpsBuffer = Array(this.fpsBufferLength).fill(0);
    this.reset();
  }

  public getIndex(): number {
    const now = Date.now();
    const diff = (now - this.start) / 1000;
    const diffSeconds = Math.floor(diff);
    const arrayIndex = diffSeconds % this.fpsBuffer.length;

    return arrayIndex;
  }

  public tick() {
    const currentIndex = this.getIndex();

    if (currentIndex !== this.lastIndex) {
      this.lastIndex = currentIndex;
      this.fpsBuffer[this.lastIndex] = 0;
    }

    this.fpsBuffer[currentIndex] += 1;
  }

  public fps() {
    return this.fpsBuffer[this.lastIndex];
  }

  public averageFps(): number {
    let total = 0;
    let divisor = 1;

    for (let i = 0; i < this.fpsBuffer.length; i++) {
      const n = this.fpsBuffer[i];
      total += n;

      if (n > 0) {
        divisor += 1;
      }
    }

    return total / divisor;
  }

  public startStats() {
    this.reset();
  }

  public reset() {
    this.fpsBuffer.fill(0);
    this.start = Date.now();
  }
}

const statSystem = LazySystem.init({ res: [Stats] }, ({ resources }) => {
  const [stats] = resources;
  stats.tick();
});
