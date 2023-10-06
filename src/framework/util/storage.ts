import AsyncStorage from '@react-native-async-storage/async-storage';
import RNConfigReader from 'react-native-config-reader';
import { MMKV } from 'react-native-mmkv';

import { getOverrideName } from './string';
import { Trackers } from './tracker';

export namespace Storage {
  export const storage = new MMKV({ id: getOverrideName(), encryptionKey: RNConfigReader.CFBundleIdentifier });

  export const setItemJson = async <T>(key: string, data: T) => {
    try {
      storage.set(key, JSON.stringify(data));
    } catch (error) {
      throw new Error(
        `[Storage] setItemJson: failed to write key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

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

  export const removeItem = async (key: string) => {
    try {
      storage.delete(key);
    } catch (error) {
      throw new Error(
        `[Storage] removeItemJson: failed to remove key "${key}"${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
    }
  };

  export const migrateItemJson = async <ItemType>(
    oldAsyncStorageKey: string,
    newAsyncStorageKey: string,
  ): Promise<ItemType | undefined> => {
    const settingsToMigrate: ItemType | undefined = await getItemJson(oldAsyncStorageKey);
    if (settingsToMigrate) {
      await removeItem(oldAsyncStorageKey);
      return settingsToMigrate;
    } else return undefined;
  };

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

export const migrateItemJson = async <ItemType>(oldAsyncStorageKey: string, newAsyncStorageKey: string) => {
  const settingsToMigrate = await Storage.migrateItemJson(oldAsyncStorageKey, newAsyncStorageKey);
  return settingsToMigrate as ItemType | undefined;
};
