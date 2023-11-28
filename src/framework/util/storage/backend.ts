import { StorageHandler } from './handler';
import type { IStorageBackend, StorageKey } from './types';

export class StorageBackend extends StorageHandler<IStorageBackend> implements IStorageBackend {
  constructor(storage: IStorageBackend, storageName?: string) {
    super(storage, storageName);
  }
  contains(key: StorageKey): boolean {
    return this.storage.contains(key);
  }
  delete(key: StorageKey): void {
    return this.storage.delete(key);
  }
  getBoolean(key: StorageKey): boolean | undefined {
    return this.storage.getBoolean(key);
  }
  getNumber(key: StorageKey): number | undefined {
    return this.storage.getNumber(key);
  }
  getString(key: StorageKey): string | undefined {
    return this.storage.getString(key);
  }
  set(key: StorageKey, value: string | number | boolean): void {
    return this.storage.set(key, value);
  }
  getAllKeys(): StorageKey[] {
    return this.storage.getAllKeys();
  }
}
