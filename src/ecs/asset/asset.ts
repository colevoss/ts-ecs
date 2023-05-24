export abstract class AssetComponent<T> {
  public asset: AssetHandle<T>;

  constructor(asset: AssetHandle<T>) {
    this.asset = asset;
  }
}

export class AssetHandle<T> {
  protected server: AssetServer<T>;
  constructor(server: AssetServer<T>) {
    this.server = server;
  }

  public fetch(): T {
    const asset = this.server.get(this);

    if (!asset) {
      throw new Error("Asset not available in asset server");
    }

    return asset;
  }
}

export class AsyncAssetHandle<T> extends AssetHandle<T> {
  #loaded: boolean;

  constructor(server: AsyncAssetServer<T>, loaded: boolean = false) {
    super(server);
    this.#loaded = loaded;
  }

  public get loaded(): boolean {
    return this.#loaded;
  }

  public load(): this {
    this.#loaded = true;
    return this;
  }
}

export abstract class AssetServer<T> {
  private assets: WeakMap<AssetHandle<T>, T> = new WeakMap();

  public add(asset: T) {
    const handle = new AssetHandle<T>(this);
    // this.assets.set(handle, asset);
    this.setAsset(handle, asset);
    return handle;
  }

  public get(handle: AssetHandle<T>): T | undefined {
    return this.assets.get(handle);
  }

  protected setAsset(handle: AssetHandle<T>, asset: T) {
    this.assets.set(handle, asset);
  }
}

export abstract class AsyncAssetServer<T> extends AssetServer<T> {
  public load(path: string): AsyncAssetHandle<T> {
    const loader = this.loader(path);
    const handle = new AsyncAssetHandle<T>(this);

    loader.then((asset) => {
      this.setAsset(handle, asset);
      handle.load();
    });

    return handle;
  }

  protected abstract loader(path: string): Promise<T>;
}

// class ImageAssetServer extends AsyncAssetServer<HTMLImageElement> {
//   public loader(path: string): Promise<HTMLImageElement> {
//     const img = new Image();
//     img.src = path;
//
//     const loader = new Promise<HTMLImageElement>((resolve) => {
//       img.addEventListener("load", () => {
//         resolve(img);
//       });
//     });
//
//     return loader;
//   }
// }
