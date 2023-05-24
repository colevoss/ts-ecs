import { Entity } from "../entity";

export type Constructor = new (...args: any[]) => {};

const componentName = Symbol("COMPONENT_NAME");

export interface IComponent {
  [componentName]: string;
}

export class ComponentEntry<T> {
  private _generation: number;
  private _value: T;

  constructor(generation: number, value: T) {
    this._generation = generation;
    this._value = value;
  }

  public get generation() {
    return this._generation;
  }

  public get value() {
    return this._value;
  }
}

export class ComponentList<T> {
  private components: (ComponentEntry<T> | undefined)[] = [];

  public set(entity: Entity, value: T): ComponentEntry<T> {
    const component = new ComponentEntry<T>(entity.generation, value);
    this.components[entity.index] = component;

    return component;
  }

  public get(entity: Entity): T | null {
    const componentEntry = this.components[entity.index];

    if (!componentEntry) {
      return null;
    }

    if (componentEntry.generation !== entity.generation) {
      return null;
    }

    return componentEntry.value;
  }

  public has(entity: Entity): boolean {
    const componentEntry = this.components[entity.index];

    if (!componentEntry) {
      return false;
    }

    return componentEntry.generation === entity.generation;
  }

  public remove(entity: Entity): boolean {
    if (!this.has(entity)) {
      return false;
    }

    this.components[entity.index] = undefined;
    return true;
  }
}

// Idea: This decorator could store the component type in an array and somehow
// cache the index in that array for faster lookup and compnent storage.
export function Component(name?: string) {
  return <T extends Constructor>(superClass: T) => {
    const ComponentClass = class extends superClass implements IComponent {
      [componentName] = name || superClass.name;
      static [componentName] = name || superClass.name;

      constructor(...args: any[]) {
        super(...args);
      }
    };

    return ComponentClass;
  };
}

export function getComponentName(component: {
  [componentName]?: string;
}): string | null {
  return component[componentName] || null;
}

type BundleType<T> = {
  [K in keyof T]-?: T[K] extends infer R ? R : never;
};

type ComponentBundleResult<T> = T[keyof T][];

export function bundle<T>() {
  return (componentBundle: BundleType<T>): ComponentBundleResult<T> => {
    const components = [];

    for (const k in componentBundle) {
      const component = componentBundle[k];
      components.push(component);
    }

    return components as ComponentBundleResult<T>;
  };
}

export class ComponentListMap {
  private componentListMap: Map<string, ComponentList<unknown>> = new Map();

  public getOrCreate<T>(t: unknown): ComponentList<T> | null {
    // @ts-ignore
    const componentName = getComponentName(t);

    if (!componentName) {
      throw new Error(`Not a component ${t}`);
    }

    if (!this.componentListMap.has(componentName)) {
      const componentList = new ComponentList<T>();
      this.componentListMap.set(componentName, componentList);
      return componentList;
    }

    return this.componentListMap.get(componentName) as ComponentList<T>;
  }

  public get<T>(t: unknown): ComponentList<T> | null {
    // @ts-ignore
    const componentName = getComponentName(t);

    if (!componentName) {
      throw new Error(`Not a component ${t}`);
    }

    return (
      (this.componentListMap.get(componentName) as ComponentList<T>) || null
    );
  }

  public get maps(): Map<string, ComponentList<unknown>> {
    return this.componentListMap;
  }
}
