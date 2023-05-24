export class Entity {
  private _isLive: boolean;
  private _reserved: boolean;
  private _generation: number;
  private _index: number;

  constructor(index: number) {
    this._generation = 0;
    this._isLive = true;
    this._reserved = false;
    this._index = index;
  }

  public get generation(): number {
    return this._generation;
  }

  public get isLive(): boolean {
    return this._isLive && !this._reserved;
  }

  public get index(): number {
    return this._index;
  }

  public incrementGeneration(): void {
    this._generation += 1;
  }

  public unkill(): void {
    this._isLive = true;
  }

  public reserve(): void {
    this._reserved = true;
  }

  public unreserve(): void {
    this._reserved = false;
  }

  public kill() {
    this._isLive = false;
  }
}
