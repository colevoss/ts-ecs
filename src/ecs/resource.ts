type Constructor = new (...args: any[]) => {};

export class ResourceContainer {
  private resourceMap: Map<Function, unknown> = new Map();

  public set<T extends Constructor>(t: InstanceType<T>) {
    const constructor = t.constructor;
    this.resourceMap.set(constructor, t);
  }

  public getResource<T extends Constructor>(t: T): InstanceType<T> {
    const resource = this.resourceMap.get(t);

    if (!resource) {
      throw new Error(`Resource not available, ${t}`);
    }

    return resource as InstanceType<T>;
  }
}
