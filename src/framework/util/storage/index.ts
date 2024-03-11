import { StorageHandler } from './handler';
import { mmkvHandler } from './mmkv';
import { StorageSlice } from './slice';
import { StorageKey, StorageTypeMap } from './types';
import { Trackers } from '../tracker';

/**
 * Use MMKV as the storage technology.
 */
const defaultStorage = mmkvHandler;

/**
 * Storage API
 */
export class Storage {
  static create<Types extends { [key: StorageKey]: any }>() {
    return new StorageSlice<Types>(defaultStorage);
  }

  static compose<Types extends { [key: StorageKey]: any }, Storage extends StorageSlice<StorageTypeMap>>(subStorage: Storage) {
    return new StorageSlice<Types>(subStorage, subStorage.name);
  }

  static global = defaultStorage;
}

/// OLD CODE BELOW

export const OldStorageFunctions = {
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
      defaultStorage.set(key, JSON.stringify(data));
    } catch (error) {
      console.warn(
        `[Storage] setItemJson: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'setItemJson ERROR', (error as Error | null)?.message || '');
    }
  },

  /**
   * Set item JSON
   * - Convert data into JSON string
   * - Save data and key within storage
   */
  setItem: async <T extends string | number | boolean>(key: string, data: T) => {
    try {
      defaultStorage.set(key, data);
    } catch (error) {
      console.warn(
        `[Storage] setItem: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'setItem ERROR', (error as Error | null)?.message || '');
    }
  },

  /**
   * Get item JSON
   * - Retrieve stored item via key
   * - Parse and return item
   */
  getItemJson: async <T>(key: string) => {
    try {
      const item = defaultStorage.getString(key);
      const parsedItem = item && JSON.parse(item);
      return parsedItem as T | undefined;
    } catch (error) {
      console.warn(
        `[Storage] getItemJson: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'getItemJson ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

  /**
   * Get item JSON
   * - Retrieve stored item via key
   * - Parse and return item
   */
  getItem: async <T extends string | number | boolean>(key: string) => {
    try {
      const item = defaultStorage.getString(key);
      return item as T | undefined;
    } catch (error) {
      console.warn(
        `[Storage] getItem: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'getItem ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

  /**
   * Remove item
   * - Find stored item via key
   * - Remove item from storage
   */
  removeItem: async (key: string) => {
    try {
      defaultStorage.delete(key);
    } catch (error) {
      console.warn(
        `[Storage] removeItemJson: failed to remove key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'removeItem ERROR', (error as Error | null)?.message || '');
    }
  },

  /**
   * Remove items
   * - Find all items via provided keys
   * - Remove each item from storage
   */
  removeItems: async (keys: string[]) => {
    try {
      for (const key of keys) {
        defaultStorage.delete(key);
      }
    } catch (error) {
      console.warn(
        `[Storage] removeItems: failed to remove items ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'removeItems ERROR', (error as Error | null)?.message || '');
    }
  },

  /**
   * Get keys
   * - Find all existing keys within storage
   * - Return keys
   */
  getKeys: async () => {
    try {
      const keys = defaultStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.warn(`[Storage] getKeys: failed to get all keys ${error instanceof Error ? `: ${(error as Error).message}` : ''}`);
      Trackers.trackDebugEvent('Storage', 'getKeys ERROR', (error as Error | null)?.message || '');
      return null;
    }
  },

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
   * Initiate storage
   */
  init: async () => {
    await StorageHandler.initAllStorages();
  },
};
