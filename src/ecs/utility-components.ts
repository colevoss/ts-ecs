export abstract class EmptyComponent {}
export abstract class TagComponent {}

export abstract class ValueComponent<T> {
  public value: T;

  constructor(value: T) {
    this.value = value;
  }
}

export abstract class NumberComponent extends ValueComponent<number> {}
export abstract class BoolComponent extends ValueComponent<boolean> {}
export abstract class StringComponent extends ValueComponent<string> {}
