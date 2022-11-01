import { Entity } from "./entity";

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
  components: (ComponentEntry<T> | undefined)[] = [];

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

export abstract class CComponent {}

export function Component(name?: string) {
  return <T extends Constructor>(superClass: T) => {
    const newClass = class extends superClass implements IComponent {
      [componentName] = name || superClass.name;
      static [componentName] = name || superClass.name;

      constructor(...args: any[]) {
        super(...args);
      }
    };

    return newClass;
  };
}

export function getComponentName(component: {
  [componentName]?: string;
}): string | null {
  return component[componentName] || null;
}
