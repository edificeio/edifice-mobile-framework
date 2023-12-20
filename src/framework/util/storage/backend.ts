import { StorageHandler } from './handler';
import type { IStorageBackend, StorageKey } from './types';

export class StorageBackend extends StorageHandler<IStorageBackend> implements IStorageBackend {
  static BOOL_FALSE = 0;

  static BOOL_TRUE = 1;

  contains(key: StorageKey): boolean {
    return this.storage.contains(key);
  }

  delete(key: StorageKey): void {
    return this.storage.delete(key);
  }

  getBoolean(key: StorageKey): boolean | undefined {
    const val = this.storage.getNumber(key);
    console.debug('SB get boolean', key, val, typeof val);
    if (val === StorageBackend.BOOL_TRUE) return true;
    if (val === StorageBackend.BOOL_FALSE) return false;
    else return undefined;
  }

  getNumber(key: StorageKey): number | undefined {
    return this.storage.getNumber(key);
  }

  getString(key: StorageKey): string | undefined {
    return this.storage.getString(key);
  }

  set(key: StorageKey, value: string | number | boolean): void {
    if (typeof value === 'boolean') {
      console.debug('SB set boolean', key, value, typeof value);
      return this.storage.set(key, value ? StorageBackend.BOOL_TRUE : StorageBackend.BOOL_FALSE);
    } else return this.storage.set(key, value);
  }

  getAllKeys(): StorageKey[] {
    return this.storage.getAllKeys();
  }
}
