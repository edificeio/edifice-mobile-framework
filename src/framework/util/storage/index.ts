import { StorageHandler } from './handler';
import { mmkvStorageHelper } from './mmkv';
import { StorageSlice } from './slice';
import { IStorageBackend, IStorageDict, StorageKey, StorageTypeMap } from './types';

/**
 * Use MMKV as the storage technology.
 */
const defaultStorage = mmkvStorageHelper;

/**
 * Storage API
 */
export const storage = {
  /**
   * defines a storage space that is a predefined subsection of the global storage with optional init phases.
   * @returns the storage created
   */
  create: <Types extends { [key: StorageKey]: any }>() => {
    return new StorageSlice<Types, IStorageBackend>(defaultStorage);
  },

  /**
   * defines a storage space that encompass another with additional prefixes and/or init phases.
   * @param subStorage
   * @returns
   */
  compose: <Types extends { [key: StorageKey]: any }, Storage extends IStorageDict<StorageTypeMap>>(subStorage: Storage) => {
    return new StorageSlice<Types, Storage>(subStorage);
  },

  /**
   * Access to the global storage directly.
   */
  global: defaultStorage,
};

/// OLD CODE BELOW

export const StorageObject = {
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
      throw new Error(
        `[Storage] setItemJson: failed to write key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(
        `[Storage] setItem: failed to write key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(
        `[Storage] getItemJson: failed to load key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(
        `[Storage] getItem: failed to load key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(
        `[Storage] removeItemJson: failed to remove key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(
        `[Storage] removeItems: failed to remove items${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
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
      throw new Error(`[Storage] getKeys: failed to get all keys${error instanceof Error ? `: ${(error as Error).message}` : ''}`);
    }
  },

  /**
   * Migrate item JSON
   * - Get notifications filter setting to migrate (via its current key)
   * - Return setting and remove it from storage
   */
  migrateItemJson: async <ItemType>(oldKey: string): Promise<ItemType | undefined> => {
    const notifFilterSetting: ItemType | undefined = await StorageObject.getItemJson(oldKey);
    if (notifFilterSetting) {
      await StorageObject.removeItem(oldKey);
      return notifFilterSetting;
    } else return undefined;
  },

  /**
   * Initiate storage
   */
  init: async () => {
    await StorageHandler.initAllStorages();
  },
};

export const setItemJson = async <T>(key: string, data: T) => {
  await StorageObject.setItemJson(key, data);
};

export const getItemJson = async <T>(key: string) => {
  const parsedItem = await StorageObject.getItemJson(key);
  return parsedItem as T | undefined;
};

export const removeItem = async (key: string) => {
  await StorageObject.removeItem(key);
};

export const removeItems = async (keys: string[]) => {
  await StorageObject.removeItems(keys);
};

export const getKeys = async () => {
  const keys = await StorageObject.getKeys();
  return keys;
};

export const migrateItemJson = async <ItemType>(oldKey: string) => {
  const settingsToMigrate = await StorageObject.migrateItemJson(oldKey);
  return settingsToMigrate as ItemType | undefined;
};
