import { Component, NumberComponent } from "../ecs";

@Component()
export class Transform {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

@Component()
export class Rect {
  constructor(public width: number, public height: number) {}
}

@Component()
export class Direction {
  constructor(public x: number, public y: number) {}
}

@Component()
export class Speed extends NumberComponent {}
