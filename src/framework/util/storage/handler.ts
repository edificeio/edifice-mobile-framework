import type { AuthLoggedAccount } from '~/framework/modules/auth/model';

import { IStorageBackend, StorageKey } from './types';

export class StorageHandler {
  constructor(
    protected storage: StorageHandler | IStorageBackend,
    public name?: string,
  ) {}

  private static storageListWithAppInit: StorageHandler[] = [];

  private static storageListWithSessionInit: StorageHandler[] = [];

  private static initPhaseDone: boolean = false;

  private isInitialized: boolean = false;

  private init?: () => void;

  /**
   * Execute this function when the app startup. Use the `function` keyword instead of `() => {}` to use `this` keyword inside the function.
   * @param initFn
   * @returns
   */
  setAppInit(initFn: (this: this) => void) {
    if (this.isInitialized) {
      console.warn('[Storage] Do not use `withInit()` twice.');
      return this;
    }

    this.init = async () => {
      console.debug(`[Storage] init storage '${this.name ?? this.constructor.name}'`);
      initFn.call(this);
      this.isInitialized = true;
    };

    StorageHandler.storageListWithAppInit.push(this);
    if (StorageHandler.initPhaseDone) {
      this.init();
    }

    return this;
  }

  private sessionInit?: (session: AuthLoggedAccount) => void;

  /**
   * Execute this function whenever a user logs in. Use the `function` keyword instead of `() => {}` to use `this` keyword inside the function.
   * @param initFn
   */
  setSessionInit(initFn: (this: this, session: AuthLoggedAccount) => void) {
    this.sessionInit = async (session: AuthLoggedAccount) => {
      console.debug(`[Storage] session init storage '${this.name ?? this.constructor.name}'`);
      initFn.call(this, session);
    };

    StorageHandler.storageListWithSessionInit.push(this);

    return this;
  }

  static async initAllStorages() {
    for (const storage of StorageHandler.storageListWithAppInit) {
      try {
        if (!storage.isInitialized) {
          storage.init?.();
        }
      } catch (e) {
        console.error(`[Storage] storage '${storage.name ?? storage.constructor.name}' failed to init`, e);
      }
    }
    StorageHandler.initPhaseDone = true;
  }

  static async sessionInitAllStorages(session: AuthLoggedAccount) {
    for (const storage of StorageHandler.storageListWithSessionInit) {
      try {
        storage.sessionInit?.(session);
      } catch (e) {
        console.error(`[Storage] storage '${storage.name ?? storage.constructor.name}' failed to session init`, e);
      }
    }
  }

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
    if (val === StorageHandler.BOOL_TRUE) return true;
    if (val === StorageHandler.BOOL_FALSE) return false;
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
      return this.storage.set(key, value ? StorageHandler.BOOL_TRUE : StorageHandler.BOOL_FALSE);
    } else return this.storage.set(key, value);
  }

  getAllKeys(): StorageKey[] {
    return this.storage.getAllKeys();
  }
}
