import * as T from "three";
import { Component, EmptyComponent, NumberComponent } from "../ecs";

@Component()
export class Projectile extends T.Object3D {
  // public mesh: T.Mesh;

  constructor() {
    super();

    const geometry = new T.SphereGeometry(0.5, 32, 16);
    // const geometry = new T.CapsuleGeometry(0.5, 1);
    // const geometry = new T.BoxGeometry(1, 1, 1);
    const material = new T.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new T.Mesh(geometry, material);

    // const helper = new T.AxesHelper(1);

    super.add(mesh);
    // super.add(helper);

    // super(geometry, mesh);

    // this.mesh = mesh;
  }
}

@Component()
export class Fire extends NumberComponent {}

@Component()
export class Fired extends NumberComponent {
  public readonly firedAt: number;

  constructor(value: number, firedAt: number) {
    super(value);
    this.firedAt = firedAt;
  }

  public isExpired(now: number) {
    return false;
    return now - this.firedAt > 5;
  }
}

@Component()
export class ExpiredProjectile extends EmptyComponent {}

@Component()
export class ProjectileManager {
  public lastFiredAt: number;
  public delay: number;

  constructor(delay: number) {
    this.lastFiredAt = -1;
    this.delay = delay;
  }

  public canShoot(): boolean {
    if (this.lastFiredAt === -1) {
      return true;
    }

    // console.log(Date.now(), this.lastFiredAt, Date.now() - this.lastFiredAt);

    return Date.now() - this.lastFiredAt > this.delay;
  }

  public shoot() {
    this.lastFiredAt = Date.now();
  }
}
