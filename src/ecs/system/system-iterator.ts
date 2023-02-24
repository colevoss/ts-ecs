import { Vertex } from "./system-vertex";

type VertexIteratorResult<T extends Vertex> = {
  done: boolean;
  value?: T;
};

export class DepthFirstIterator<T extends Vertex = Vertex> {
  private vertex: T;
  private edgeIndex = -1;
  private hasIteratedThis = false;
  private currentEdgeIterable?: DepthFirstIterator<T>;

  constructor(vertex: T) {
    this.vertex = vertex;
    // this.currentEdgeIterable = this.vertex.edges[this.edgeIndex].to.depthIter();
  }

  next(): VertexIteratorResult<T> {
    // Start with this vertex
    if (!this.hasIteratedThis) {
      this.hasIteratedThis = true;
      return {
        done: false,
        value: this.vertex,
      };
    }

    return this.getNextValue();
  }

  private getNextValue(): VertexIteratorResult<T> {
    // If no edge iterable has been created, try to progress
    if (!this.currentEdgeIterable) {
      // If no edge to progress to we are done
      if (!this.progressToNextEdge()) {
        return { done: true };
      }
    }

    // We know that ther is a currentEdgeIterable here because
    // progressToNextEdge sets one if it returns true
    const next = this.currentEdgeIterable!.next();

    if (!next.done) {
      return next;
    }

    if (!this.progressToNextEdge()) {
      return { done: true };
    }

    return this.getNextValue();
  }

  private progressToNextEdge(): boolean {
    const nexEdgetIndex = this.edgeIndex + 1;

    const nextEdge = this.vertex.edges[nexEdgetIndex];
    // console.log({ nextEdge });

    if (nextEdge === undefined) {
      return false;
    }

    this.currentEdgeIterable = nextEdge.to.iter() as DepthFirstIterator<T>;
    this.edgeIndex = nexEdgetIndex;
    return true;
  }

  [Symbol.iterator]() {
    return this;
  }
}
