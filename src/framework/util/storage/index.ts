import { StorageHandler } from './handler';
import { mmkvHandler } from './mmkv';
import { StorageSlice } from './slice';
import { StorageTypeMap } from './types';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IAuthState } from '~/framework/modules/auth/reducer';
import { IModuleConfig } from '~/framework/util/moduleTool';
import { Trackers } from '~/framework/util/tracker';

/**
 * Use MMKV as the storage technology.
 */
const defaultStorage = mmkvHandler;

/**
 * Storage API
 */
export class Storage {
  static global = defaultStorage;

  static slice<Types extends StorageTypeMap>() {
    return new StorageSlice<Types>(defaultStorage);
  }

  static compose<StorageType extends StorageHandler>(subStorage: StorageType) {
    return new StorageSlice(subStorage, subStorage.name) as unknown as StorageType;
  }

  static create<Types extends StorageTypeMap>(module: IModuleConfig<string, any>) {
    return Storage.slice<Types>().withModule(module);
  }

  static PREFERENCES_PREFIX = '@';

  static preferences<Types extends StorageTypeMap>(
    module: IModuleConfig<string, any>,
    initFn: (this: StorageSlice<Types>, session: AuthLoggedAccount) => void
  ) {
    const ret = Storage.compose(Storage.create<Types>(module));
    ret.setSessionInit(function (session) {
      this.setPrefix(`${Storage.PREFERENCES_PREFIX}${session.user.id}`);
      initFn.call(this, session);
    });
    return ret;
  }

  static erasePreferences(id: keyof IAuthState['accounts']) {
    const keys = Storage.global.getAllKeys().filter(k => k.startsWith(`${Storage.PREFERENCES_PREFIX}${id}`));
    for (const key of keys) {
      Storage.global.delete(key);
    }
  }

  static async init() {
    await StorageHandler.initAllStorages();
  }

  static async sessionInit(session: AuthLoggedAccount) {
    await StorageHandler.sessionInitAllStorages(session);
  }
}

/// OLD CODE BELOW

export const OldStorageFunctions = {
  //
  /**
   * Get item JSON
   * - Retrieve stored item via key
   * - Parse and return item
   */
  getItem: async <T extends string | number | boolean>(key: string) => {
    try {
      const item = Storage.global.getString(key);
      return item as T | undefined;
    } catch (error) {
      console.error(
        `[Storage] getItem: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'getItem ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

  /**
   * Get item JSON
   * - Retrieve stored item via key
   * - Parse and return item
   */
  getItemJson: async <T>(key: string) => {
    try {
      const item = Storage.global.getString(key);
      const parsedItem = item && JSON.parse(item);
      return parsedItem as T | undefined;
    } catch (error) {
      console.error(
        `[Storage] getItemJson: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'getItemJson ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

  //
  /**
   * Get keys
   * - Find all existing keys within storage
   * - Return keys
   */
  getKeys: async () => {
    try {
      const keys = Storage.global.getAllKeys();
      return keys;
    } catch (error) {
      console.error(`[Storage] getKeys: failed to get all keys ${error instanceof Error ? `: ${(error as Error).message}` : ''}`);
      Trackers.trackDebugEvent('Storage', 'getKeys ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

  //
  /**
   * Migrate item JSON
   * - Get notifications filter setting to migrate (via its current key)
   * - Return setting and remove it from storage
   */
  migrateItemJson: async <ItemType>(oldKey: string): Promise<ItemType | undefined> => {
    const data: ItemType | undefined = (await OldStorageFunctions.getItemJson(oldKey)) ?? undefined;
    if (data) {
      await OldStorageFunctions.removeItem(oldKey);
      return data;
    } else return undefined;
  },

  /**
   * Remove item
   * - Find stored item via key
   * - Remove item from storage
   */
  removeItem: async (key: string) => {
    try {
      Storage.global.delete(key);
    } catch (error) {
      console.error(
        `[Storage] removeItemJson: failed to remove key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'removeItem ERROR', (error as Error | null)?.message || '');
    }
  },

  //
  /**
   * Remove items
   * - Find all items via provided keys
   * - Remove each item from storage
   */
  removeItems: async (keys: string[]) => {
    try {
      for (const key of keys) {
        Storage.global.delete(key);
      }
    } catch (error) {
      console.error(
        `[Storage] removeItems: failed to remove items ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'removeItems ERROR', (error as Error | null)?.message || '');
    }
  },

  /**
   * Set item JSON
   * - Convert data into JSON string
   * - Save data and key within storage
   */
  setItem: async <T extends string | number | boolean>(key: string, data: T) => {
    try {
      Storage.global.set(key, data);
    } catch (error) {
      console.error(
        `[Storage] setItem: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'setItem ERROR', (error as Error | null)?.message || '');
    }
  },

  //
  //
  //
  //
  // === Legacy zone ===
  //
  //
  //
  //
  /**
   * Set item JSON
   * - Convert data into JSON string
   * - Save data and key within storage
   */
  setItemJson: async <T>(key: string, data: T) => {
    try {
      Storage.global.set(key, JSON.stringify(data));
    } catch (error) {
      console.error(
        `[Storage] setItemJson: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`
      );
      Trackers.trackDebugEvent('Storage', 'setItemJson ERROR', (error as Error | null)?.message || '');
    }
  },
};
