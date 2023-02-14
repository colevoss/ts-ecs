export class Timer {
  start: number;
  last: number;
  deltaTime: number;
  public betterDur: number;

  constructor() {
    this.last = Date.now();
    this.start = this.last;
    this.deltaTime = 0;
    this.betterDur = 0;
  }

  public reset() {
    this.start = Date.now();
  }

  public duration() {
    return (Date.now() - this.start) / 1000;
  }

  // public get deltaTime(): number {
  //   return (Date.now() - this.last) / 1000;
  // }

  public tick(_t?: number) {
    // this.last = t || Date.now();
    const now = Date.now();
    this.deltaTime = (now - this.last) / 1000;
    this.last = now;
    this.betterDur = (this.last - this.start) / 1000;
  }
}
