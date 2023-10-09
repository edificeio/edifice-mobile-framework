import AsyncStorage from '@react-native-async-storage/async-storage';
import RNConfigReader from 'react-native-config-reader';
import { MMKV } from 'react-native-mmkv';

import { getOverrideName } from './string';
import { Trackers } from './tracker';

export namespace Storage {
  /**
   * Create new MMKV storage (encrypted)
   */
  export const storage = new MMKV({ id: getOverrideName(), encryptionKey: RNConfigReader.CFBundleIdentifier });

  /**
   * Set item JSON
   * - Convert data into JSON string
   * - Save data and key within storage
   */
  export const setItemJson = async <T>(key: string, data: T) => {
    try {
      storage.set(key, JSON.stringify(data));
    } catch (error) {
      throw new Error(
        `[Storage] setItemJson: failed to write key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  /**
   * Get item JSON
   * - Retrieve stored item via key
   * - Parse and return item
   */
  export const getItemJson = async <T>(key: string) => {
    try {
      const item = storage.getString(key);
      const parsedItem = item && JSON.parse(item);
      return parsedItem as T | undefined;
    } catch (error) {
      throw new Error(
        `[Storage] getItemJson: failed to load key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  /**
   * Remove item
   * - Find stored item via key
   * - Remove item from storage
   */
  export const removeItem = async (key: string) => {
    try {
      storage.delete(key);
    } catch (error) {
      throw new Error(
        `[Storage] removeItemJson: failed to remove key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  /**
   * Multi remove item
   * - Find all items via provided keys
   * - Remove each item from storage
   */
  export const multiRemoveItem = async (keys: string[]) => {
    try {
      for (const key of keys) {
        storage.delete(key);
      }
    } catch (error) {
      throw new Error(
        `[Storage] multiRemoveItem: failed to remove items${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  /**
   * Get all keys
   * - Find all existing keys within storage
   * - Return keys
   */
  export const getAllKeys = async () => {
    try {
      const keys = storage.getAllKeys();
      return keys;
    } catch (error) {
      throw new Error(
        `[Storage] getAllKeys: failed to get all keys${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  /**
   * Migrate item JSON
   * - Get notifications filter setting to migrate (via its current key)
   * - Return setting and remove it from storage
   */
  export const migrateItemJson = async <ItemType>(oldKey: string): Promise<ItemType | undefined> => {
    const notifFilterSetting: ItemType | undefined = await getItemJson(oldKey);
    if (notifFilterSetting) {
      await removeItem(oldKey);
      return notifFilterSetting;
    } else return undefined;
  };

  /**
   * Migrate from AsyncStorage
   * - Find all existing AsyncStorage keys
   * - Launch migration script if some keys remain
   * - Get each key's value, add it to MMKV and remove it from AsyncStorage
   */
  const migrateFromAsyncStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const hasRemainingKeys = keys.length > 0;
    if (hasRemainingKeys) {
      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            storage.set(key, value);
            AsyncStorage.removeItem(key);
          }
        } catch (error) {
          Trackers.trackDebugEvent('Storage', 'MIGRATION ERROR', (error as Error | null)?.message || 'migrateFromAsyncStorage');
          throw error;
        }
      }
    }
  };

  /**
   * Initiate storage
   */
  export const init = async () => {
    await migrateFromAsyncStorage();
  };
}

export const setItemJson = async <T>(key: string, data: T) => {
  await Storage.setItemJson(key, data);
};

export const getItemJson = async <T>(key: string) => {
  const parsedItem = await Storage.getItemJson(key);
  return parsedItem as T | undefined;
};

export const removeItem = async (key: string) => {
  await Storage.removeItem(key);
};

export const multiRemoveItem = async (keys: string[]) => {
  await Storage.multiRemoveItem(keys);
};

export const getAllKeys = async () => {
  const keys = await Storage.getAllKeys();
  return keys;
};

export const migrateItemJson = async <ItemType>(oldKey: string) => {
  const settingsToMigrate = await Storage.migrateItemJson(oldKey);
  return settingsToMigrate as ItemType | undefined;
};
