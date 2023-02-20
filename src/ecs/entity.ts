export class Entity {
  private _isLive: boolean;
  private _generation: number;
  private _index: number;

  constructor(index: number) {
    this._generation = 0;
    this._isLive = true;
    this._index = index;
  }

  public get generation(): number {
    return this._generation;
  }

  public get isLive(): boolean {
    return this._isLive;
  }

  public get index(): number {
    return this._index;
  }

  public incrementGeneration(): void {
    this._generation += 1;
    this._isLive = true;
  }

  public kill() {
    this._isLive = false;
  }
}

export class EntityAllocator {
  public entities: Entity[] = [];
  private free: number[] = [];

  public allocate(): Entity {
    if (this.free.length) {
      const freeIndex = this.free.shift()!;
      const entity = this.entities[freeIndex];

      entity.incrementGeneration();

      return entity;
    }

    const index = this.entities.length;
    const entity = new Entity(index);

    this.entities.push(entity);

    return entity;
  }

  public dealloc(entity: Entity): boolean {
    const entry = this.entities[entity.index];

    if (!entry) {
      return false;
    }

    if (!entry.isLive) {
      return false;
    }

    entry.kill();
    this.free.push(entity.index);

    return true;
  }

  public isLive(entity: Entity): boolean {
    const entry = this.entities[entity.index];

    if (!entry) {
      return false;
    }

    return entry.isLive;
  }
}
