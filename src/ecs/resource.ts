type Constructor = new (...args: any[]) => {};

export class ResourceContainer {
  // TODO: Clean this up. No Function type
  private resourceMap: Map<Function, unknown> = new Map();

  public set<T extends Constructor>(resource: InstanceType<T>) {
    const constructor = resource.constructor;
    this.resourceMap.set(constructor, resource);
  }

  public getResource<T extends Constructor>(resourceType: T): InstanceType<T> {
    const resource = this.resourceMap.get(resourceType);

    if (!resource) {
      throw new Error(`Resource not available, ${resourceType}`);
    }

    return resource as InstanceType<T>;
  }
}
