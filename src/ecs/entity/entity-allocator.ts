import { Entity } from "./entity";

export class EntityAllocator {
  public entities: Entity[] = [];
  private free: number[] = [];

  public allocate(): Entity {
    const freeEntity = this.getFreeEntity();
    if (freeEntity !== undefined) {
      return freeEntity;
    }

    return this.createNewEntity();
  }

  public preserve(): Entity {
    const freeEntity = this.getFreeEntity();

    if (freeEntity !== undefined) {
      freeEntity.reserve();
      return freeEntity;
    }

    const entity = this.createNewEntity();
    entity.reserve();
    return entity;
  }

  private getFreeEntity(): Entity | undefined {
    // No freed indexes at the moment
    if (this.free.length === 0) {
      return;
    }

    const freeIndex = this.free.shift()!; // freeIndex cannot be undefined since we know length is not 0
    const entity = this.entities[freeIndex];

    entity.incrementGeneration();
    entity.unkill();

    return entity;
  }

  private createNewEntity(): Entity {
    const index = this.entities.length;
    const entity = new Entity(index);
    this.entities.push(entity);
    return entity;
  }

  public getById(id: number): Entity | undefined {
    const entity = this.entities[id];

    if (!entity || !entity.isLive) {
      return;
    }

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
