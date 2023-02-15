export enum TimerMode {
  Once = "Once",
  Repeating = "Repeating",
}

export class Timer {
  private time: number;
  private elapsed: number = 0;
  private mode: TimerMode;
  public remaining: number = 0;
  // Time in seconds
  constructor(time: number, mode: TimerMode = TimerMode.Once) {
    this.time = time;
    this.mode = mode;
  }

  // number in seconds
  public tick(delta: number) {
    this.elapsed = this.elapsed + delta;
    this.remaining = this.time - this.elapsed;

    const done = this.elapsed >= this.time;

    if (done && this.mode === TimerMode.Repeating) {
      this.elapsed = 0;
    }

    return done;
  }

  public static fromSeconds(
    seconds: number,
    mode: TimerMode = TimerMode.Once
  ): Timer {
    return new Timer(seconds, mode);
  }

  public static fromMs(ms: number, mode: TimerMode = TimerMode.Once): Timer {
    return new Timer(ms / 1000, mode);
  }

  public static fromMinutes(
    minutes: number,
    mode: TimerMode = TimerMode.Once
  ): Timer {
    const seconds = minutes * 60;
    return new Timer(seconds, mode);
  }
}
