export class TwoDee {
  public canvasElement: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public readonly scaleFactor: number;

  private windowWidth: number;
  private windowHeight: number;

  private canvasWidth: number = 0;
  private canvasHeight: number = 0;

  constructor() {
    const element = document.querySelector("#twodee");

    if (!element) {
      throw new Error("No Element");
    }

    this.canvasElement = element as HTMLCanvasElement;
    const ctx = this.canvasElement.getContext("2d", { alpha: false });

    if (!ctx) {
      throw new Error("Cannot get 2d context");
    }

    this.scaleFactor = window.devicePixelRatio;

    this.windowWidth = document.body.clientWidth;
    this.windowHeight = document.body.clientHeight;

    this.ctx = ctx;
    this.fixPixelDensity();
    this.setupResponsiveness();
  }

  public setup() {
    document.body.appendChild(this.canvasElement);
  }

  public test() {
    this.ctx.arc(
      this.width / 2,
      this.height / 2,
      Math.min(this.height, this.width) / 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  public get height(): number {
    return this.canvasHeight;
  }

  public get width(): number {
    return this.canvasWidth;
  }

  public get centerX(): number {
    return this.canvasWidth / 2;
  }

  public get centerY(): number {
    return this.canvasHeight / 2;
  }

  public clear(): this {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this;
  }

  public fixPixelDensity() {
    this.windowWidth = document.body.clientWidth;
    this.windowHeight = document.body.clientHeight;

    this.canvasWidth = this.windowWidth * this.scaleFactor;
    this.canvasHeight = this.windowHeight * this.scaleFactor;

    this.canvasElement.width = this.canvasWidth;
    this.canvasElement.height = this.canvasHeight;

    // this.ctx.scale(this.scaleFactor, this.scaleFactor);

    this.canvasElement.style.width = `${this.windowWidth}px`;
    this.canvasElement.style.height = `${this.windowHeight}px`;
  }

  private setupResponsiveness() {
    window.addEventListener("resize", () => {
      this.fixPixelDensity();
    });
  }
}
