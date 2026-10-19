import { Trackers } from '~/framework/util/tracker';

import { AccountStorageHandler } from './account-storage-handler';
import type { AccountStorageMigration, DeviceStorageMigration } from './migrations';
import { mmkvHandler } from './mmkv';
import { StorageHandler } from './storage-handler';
import { StorageTypeMap } from './types';

/**
 * Use MMKV as the storage technology.
 */
const defaultStorageLib = mmkvHandler;

export interface DeviceStorageOptions<Types extends StorageTypeMap> {
  /** What the keys of the storage start with. Never change it once data was saved with it. */
  namespace: string;
  /** Steps that bring data of a former version to the shape read by the storage (see `migrations.ts`). They run at the app startup. */
  migrations?: DeviceStorageMigration<StorageHandler<Types>>[];
}

export interface AccountStorageOptions<Types extends StorageTypeMap> {
  /** What the keys of the storage start with. Never change it once data was saved with it. */
  namespace: string;
  /** Steps that bring data of a former version to the shape read by the storage (see `migrations.ts`). They run for each account. */
  migrations?: AccountStorageMigration<AccountStorageHandler<Types>>[];
}

/**
 * Storage API
 */
export class Storage {
  static global = defaultStorageLib;

  /**
   * Storage of what belongs to the device. Keys are typed (`Types`) and prefixed with `namespace` automatically.
   * The namespace is what the keys of the storage start with in the device: choose it once and never change it (it is not the
   * name of a module, so renaming a module leaves the keys alone).
   * To bring data of a former version to the shape read here, give `migrations` (see `migrations.ts`): such a storage must
   * then be declared in the `storages` of its module, or its use throws.
   */
  static device<Types extends StorageTypeMap>(options: DeviceStorageOptions<Types>) {
    const handler = new StorageHandler<Types>(Storage.global).setPrefix(options.namespace);
    return handler.setMigrations(
      (options.migrations ?? []).map(migration => ({
        id: migration.id,
        namespace: options.namespace,
        run: () => migration.run(handler),
        type: 'device',
      })),
    );
  }

  /**
   * Same as `device`, for what belongs to the current account: its keys are also prefixed with the id of the account.
   * The account is found when each key is read or written, so the same handler serves whichever account is signed in.
   * To bring data of a former version to the shape read here, give `migrations` (see `migrations.ts`).
   * @throws when used while there is no account.
   */
  static account<Types extends StorageTypeMap>(options: AccountStorageOptions<Types>) {
    const handler = new AccountStorageHandler<Types>(Storage.global).setPrefix(options.namespace);
    return handler.setMigrations(
      (options.migrations ?? []).map(migration => ({
        id: migration.id,
        namespace: options.namespace,
        run: accountId => migration.run(handler.for(accountId), { accountId }),
        type: 'account',
      })),
    );
  }

  /**
   * Tells how to get the id of the current account, for the account storages. Called once, by the module that manages the accounts.
   */
  static setAccountResolver = AccountStorageHandler.setAccountResolver;

  /**
   * Erases what the account storages hold for the account (and what comes with it, like the markers of its migrations).
   */
  static eraseForAccount(id: string) {
    const prefix = `${AccountStorageHandler.PREFIX_ACCOUNT}${id}${StorageHandler.PREFIX_SEPARATOR}`;
    const keys = Storage.global.getAllKeys().filter(k => k.startsWith(prefix));
    for (const key of keys) {
      Storage.global.remove(key);
    }
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
        `[Storage] getItem: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
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
        `[Storage] getItemJson: failed to load key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
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
      Storage.global.remove(key);
    } catch (error) {
      console.error(
        `[Storage] removeItemJson: failed to remove key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
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
        Storage.global.remove(key);
      }
    } catch (error) {
      console.error(
        `[Storage] removeItems: failed to remove items ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
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
        `[Storage] setItem: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'setItem ERROR', (error as Error | null)?.message || '');
    }
  },

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
        `[Storage] setItemJson: failed to write key "${key}" ${error instanceof Error ? `: ${(error as Error).message}` : ''}`,
      );
      Trackers.trackDebugEvent('Storage', 'setItemJson ERROR', (error as Error | null)?.message || '');
    }
  },
};
