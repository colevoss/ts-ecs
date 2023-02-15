export class Time {
  private start: number;
  private last: number;
  private deltaTime: number = 0;
  private dur: number = 0;
  private running: boolean = false;

  constructor() {
    this.last = Date.now();
    this.start = this.last;
  }

  public reset(): Time {
    this.last = Date.now();
    this.start = this.last;
    return this;
  }

  public run(): Time {
    if (this.running) {
      return this;
    }

    this.running = true;
    this.last = Date.now();
    return this;
  }

  public pause(): Time {
    if (!this.running) {
      return this;
    }

    this.running = false;
    this.deltaTime = 0;
    return this;
  }

  public get delta(): number {
    return this.deltaTime;
  }

  public get deltaMs(): number {
    return this.deltaTime * 1000;
  }

  public get startTime(): number {
    return this.start;
  }

  public get lastTime(): number {
    return this.last;
  }

  public get duration(): number {
    return this.dur;
  }

  public get durationMs(): number {
    return this.duration * 1000;
  }

  public tick(_t?: number): Time {
    if (!this.running) {
      return this;
    }

    const now = Date.now();
    this.deltaTime = (now - this.last) / 1000;
    this.last = now;
    this.dur = (this.last - this.start) / 1000;

    return this;
  }
}
