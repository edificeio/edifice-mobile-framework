import { StorageHandler } from './handler';
import type {
  IStorageBackend,
  KeysWithValueNotOfType,
  KeysWithValueOfType,
  StorageKey,
  StorageStringKeys,
  StorageTypeMap,
} from './types';

import type { IModuleConfig } from '~/framework/util/moduleTool';

export class StorageSlice<StorageTypes extends StorageTypeMap> extends StorageHandler {
  static separator = '.';

  protected prefix: string[] = [];

  /**
   * Add prefix at the start of the given key. If key is '', returns only the stringified prefix.
   * Recurse along the composed storage chain to apply all of the prefixes.
   * @param key
   * @returns
   */
  computeKey(key: StorageStringKeys<StorageTypes>): StorageKey {
    return this.storage instanceof StorageSlice
      ? this.prefix.length
        ? this.prefix.join(StorageSlice.separator) + (key ? StorageSlice.separator + this.storage.computeKey(key) : key)
        : this.storage.computeKey(key)
      : this.prefix.length
        ? this.prefix.join(StorageSlice.separator) + (key ? StorageSlice.separator + key : '')
        : key;
  }

  /**
   * Returns if the given key exists in storage.
   * @param key
   * @returns
   */
  contains(key: StorageStringKeys<StorageTypes>): boolean {
    return this.storage instanceof StorageSlice
      ? this.storage.#contains(this.computeKey(key))
      : this.#contains(this.computeKey(key));
  }

  #contains(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#contains(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#contains`, key);
      return (this.storage as IStorageBackend).contains(key);
    }
  }

  /**
   * Delete the given key in storage.
   * @param key
   * @returns
   */
  delete(key: StorageStringKeys<StorageTypes>): void {
    return this.storage instanceof StorageSlice ? this.storage.#delete(this.computeKey(key)) : this.#delete(this.computeKey(key));
  }

  #delete(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#delete(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#delete`, key);
      return (this.storage as IStorageBackend).delete(key);
    }
  }

  /**
   * Read a boolean value from the storage.
   * @param key
   * @returns
   */
  getBoolean(
    key: KeysWithValueOfType<StorageTypes, boolean>
  ): StorageTypes[KeysWithValueOfType<StorageTypes, boolean>] | undefined {
    return this.storage instanceof StorageSlice
      ? this.storage.#getBoolean(this.computeKey(key))
      : this.#getBoolean(this.computeKey(key));
  }

  #getBoolean(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#getBoolean(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#getBoolean`, key);
      return (this.storage as IStorageBackend).getBoolean(key);
    }
  }

  /**
   * Read a number value from the storage.
   * @param key
   * @returns
   */
  getNumber(key: KeysWithValueOfType<StorageTypes, number>): StorageTypes[KeysWithValueOfType<StorageTypes, number>] | undefined {
    return this.storage instanceof StorageSlice
      ? this.storage.#getNumber(this.computeKey(key))
      : this.#getNumber(this.computeKey(key));
  }

  #getNumber(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#getNumber(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#getNumber`, key);
      return (this.storage as IStorageBackend).getNumber(key);
    }
  }

  /**
   * Read a string value from the storage.
   * @param key
   * @returns
   */
  getString(key: KeysWithValueOfType<StorageTypes, string>): StorageTypes[KeysWithValueOfType<StorageTypes, string>] | undefined {
    return this.storage instanceof StorageSlice
      ? this.storage.#getString(this.computeKey(key))
      : this.#getString(this.computeKey(key));
  }

  #getString(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#getString(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#getString`, key);
      return (this.storage as IStorageBackend).getString(key);
    }
  }

  /**
   * Read a parsed JSON value from the storage.
   * @param key
   * @returns
   */
  getJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType
  ): StorageTypes[typeof key] | undefined {
    return this.storage instanceof StorageSlice ? this.storage.#getJSON(this.computeKey(key)) : this.#getJSON(this.computeKey(key));
  }

  #getJSON(key: StorageKey) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#getJSON(key);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#getJSON`, key);
      const str = (this.storage as IStorageBackend).getString(key);
      return str ? JSON.parse(str) : undefined;
    }
  }

  /**
   * Write a primitive value (boolean, number or string) in the storage.
   * @param key
   * @param value
   */
  set(key: KeysWithValueOfType<StorageTypes, boolean>, value: StorageTypes[KeysWithValueOfType<StorageTypes, boolean>]): void;
  set(key: KeysWithValueOfType<StorageTypes, number>, value: StorageTypes[KeysWithValueOfType<StorageTypes, number>]): void;
  set(key: KeysWithValueOfType<StorageTypes, string>, value: StorageTypes[KeysWithValueOfType<StorageTypes, string>]): void;
  set(key: unknown, value: unknown): void {
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return this.storage instanceof StorageSlice
        ? this.storage.#set(this.computeKey(key as Exclude<typeof key, unknown>), value)
        : this.#set(this.computeKey(key as Exclude<typeof key, unknown>), value);
    } else {
      throw new Error(
        `[Storage] ${this.name || this.constructor.name}#set : failed to write value that type is unknown : ${value}`
      );
    }
  }

  #set(key: StorageKey, value: boolean | number | string) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#set(key, value);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#set`, key);
      return (this.storage as IStorageBackend).set(key, value);
    }
  }

  /**
   * Write a JSON value in the storage.
   * @param key
   * @param value
   */
  setJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType,
    value: StorageTypes[typeof key]
  ): void {
    return this.storage instanceof StorageSlice
      ? this.storage.#setJSON(this.computeKey(key), value)
      : this.#setJSON(this.computeKey(key), value);
  }

  #setJSON(key: StorageKey, value: any) {
    if (this.storage instanceof StorageSlice) {
      return this.storage.#setJSON(key, value);
    } else {
      console.debug(`[Storage] ${this.name || this.constructor.name}#setJSON`, key);
      return (this.storage as IStorageBackend).set(key, JSON.stringify(value));
    }
  }

  /**
   * Defines the prefix of this storage view. Every get and set operations will be scoped with this prefix.
   * Multiple prefixes will be separated with a dot ".".
   * @param prefixes
   * @returns
   */
  setPrefix(...prefixes: string[]) {
    this.prefix = prefixes;
    return this;
  }

  /**
   * Defines the prefix of this storage view. Every get and set operations will be scoped with this prefix.
   * The `storageKey` of the module will be used as a prefix.
   * @param module
   * @returns
   */
  withModule<Name extends string>(module: IModuleConfig<Name, any>) {
    if (this.prefix.length > 0) {
      console.warn(
        `[Storage] Do not use setPrefix() or withModule() more than once, nor together. That mutates the storage '${
          this.name || this.constructor.name
        }' view.`
      );
    }
    this.setPrefix(module.storageName);
    this.name = module.storageName;
    return this;
  }
}
