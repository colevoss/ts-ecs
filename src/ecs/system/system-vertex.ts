import { DepthFirstIterator } from "./system-iterator";

export type VertexId = string;
export function VertexId(id: string): VertexId {
  return id as VertexId;
}

enum DependencyType {
  After,
  Before,
  In,
}

abstract class IDependency<T extends Vertex = Vertex> {
  public readonly type!: DependencyType;
  public readonly vertex: T;

  constructor(vertex: T) {
    this.vertex = vertex;
  }

  isAfter(): this is After<T> {
    return this.type === DependencyType.After;
  }

  isBefore(): this is Before<T> {
    return this.type === DependencyType.Before;
  }

  isIn(): this is In<T> {
    return this.type === DependencyType.In;
  }
}

class After<T extends Vertex = Vertex> extends IDependency<T> {
  type = DependencyType.After;
}

class Before<T extends Vertex = Vertex> extends IDependency<T> {
  type = DependencyType.Before;
}

class In<T extends Vertex = Vertex> extends IDependency<T> {
  type = DependencyType.In;
}

type OrderDependency<T extends Vertex = Vertex> = After<T> | Before<T>;
type Depedency<T extends Vertex = Vertex> = After<T> | OrderDependency<T>;

export class Vertex {
  private _id: VertexId;

  public readonly edges: Edge<this>[] = [];
  private parentEdge?: Edge<this>;

  public dependency?: Depedency;
  public dependencies: Depedency[] = [];

  public order?: OrderDependency;
  public parentDependency?: In;

  constructor(id?: VertexId) {
    this._id = id || Vertex.getNewId();
  }

  public add(child: Vertex): this {
    // If there is an in dependency and its not for this vertex, find the child
    // vertex and add it to that.
    if (
      child.parentDependency &&
      child.parentDependency.vertex.id() !== this.id()
    ) {
      const inVertex = this.find(child.parentDependency.vertex.id());

      if (!inVertex) {
        throw new Error(
          `Cannot find parent to add child to ${child.parentDependency.vertex.id()}`
        );
      }

      inVertex.add(child);
      return;
    }

    let weight: number;
    if (!child.order) {
      const lastWeight = this.edges[this.edges.length - 1]?.weight || -1;
      weight = lastWeight + 1;

      this.addEdge(weight, child);
      return;
    }

    const depIndex = this.edges.findIndex((e) => {
      // We know that order exists because we check it in the above if statement
      return e.to === child.order!.vertex;
    });

    if (depIndex === -1) {
      throw new Error("DEP DOESNT EXIST YET");
    }

    const dep = this.edges[depIndex];

    if (child.order.isBefore()) {
      if (depIndex === 0) {
        weight = dep.weight - 1;
      } else {
        weight =
          dep.weight -
          Math.abs(dep.weight - this.edges[depIndex - 1].weight) / 2;
      }
    } else {
      // is after
      if (depIndex + 1 === this.edges.length) {
        weight = dep.weight + 1;
      } else {
        weight =
          dep.weight +
          Math.abs(dep.weight - this.edges[depIndex + 1].weight) / 2;
      }
    }

    this.addEdge(weight, child);
    this.sortEdges();
    return this;
  }

  public children(): this[] {
    return this.edges.map((e) => {
      return e.to;
    });
  }

  public after(afterVertex: Vertex): this {
    this.order = new After(afterVertex);
    return this;
  }

  public before(beforeVertex: Vertex): this {
    this.order = new Before(beforeVertex);
    return this;
  }

  public in(inVertex: Vertex): this {
    this.parentDependency = new In(inVertex);
    return this;
  }

  public hasIn(): boolean {
    return this.parentDependency !== undefined;
  }

  public rollup(): this[] {
    const rolled: this[] = [];
    for (const vertex of this.iter()) {
      rolled.push(vertex!);
    }

    return rolled;
  }

  public log() {
    console.group(`${this.id()}:`);
    // console.group(`${this.id()}: ${this.value}`);
    for (const edge of this.edges) {
      edge.to.log();
    }
    console.groupEnd();

    return this;
  }

  public parent(): Vertex | undefined {
    if (!this.parentEdge) {
      return;
    }

    return this.parentEdge.from;
  }

  public find(id: VertexId): Vertex | undefined {
    for (const vert of this.iter()) {
      if (vert!.id() === id) {
        return vert;
      }
    }

    return;
  }

  public setParentEdge(edge: Edge<this>): this {
    this.parentEdge = edge;
    return this;
  }

  public id(): string {
    return this._id;
  }

  public setId(id: string): this {
    this._id = id;
    return this;
  }

  public label(id: string): this {
    this._id = id;
    return this;
  }

  public iter(): DepthFirstIterator<this> {
    return new DepthFirstIterator(this);
  }

  public hasEdges(): boolean {
    return this.edges.length > 0;
  }

  private sortEdges() {
    this.edges
      .sort((a, b) => a.weight - b.weight)
      .forEach((e, i) => {
        e.weight = i;
      });
  }

  private addEdge(weight: number, to: Vertex): Edge {
    const edge = new Edge(weight, this, to) as Edge<this>;
    to.setParentEdge(edge);
    this.edges.push(edge);
    return edge;
  }

  static idCounter: number = 0;
  public static getNewId(): VertexId {
    const newId = this.idCounter;
    this.idCounter += 1;

    return newId.toString();
  }
}

export class Edge<T extends Vertex = Vertex> {
  weight: number;
  from: T;
  to: T;

  constructor(weight: number, from: T, to: T) {
    this.weight = weight;
    this.from = from;
    this.to = to;
  }
}
