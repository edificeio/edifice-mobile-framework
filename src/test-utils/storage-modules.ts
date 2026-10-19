/**
 * Loads the storage modules (`Storage`, the migrations...) the way the app has them at its startup: with nothing declared, nothing
 * migrated, and an empty fake device storage. Those modules keep state (what the modules declare, what was migrated), so a test
 * that depends on it loads them again with `loadStorageModules()`.
 */

import type * as StorageApi from '~/framework/util/storage';
import type * as AccountStorageHandlerModule from '~/framework/util/storage/account-storage-handler';
import type * as MigrationsModule from '~/framework/util/storage/migrations';
import type * as StorageHandlerModule from '~/framework/util/storage/storage-handler';

import type { FakeStorageLib } from './fake-storage-lib';

// The device storage of the app (`mmkv.tsx`) is replaced by a fake one (see `__mocks__/mmkv.tsx`), and the trackers (that the old storage functions use) by nothing
jest.mock('~/framework/util/storage/mmkv');
jest.mock('~/framework/util/tracker', () => ({ Trackers: { trackDebugEvent: jest.fn() } }));

export const loadStorageModules = () => {
  let modules!: {
    lib: FakeStorageLib;
    migrations: typeof MigrationsModule;
    Storage: (typeof StorageApi)['Storage'];
    StorageHandler: (typeof StorageHandlerModule)['StorageHandler'];
    AccountStorageHandler: (typeof AccountStorageHandlerModule)['AccountStorageHandler'];
  };
  jest.isolateModules(() => {
    modules = {
      AccountStorageHandler: require('~/framework/util/storage/account-storage-handler').AccountStorageHandler,
      lib: require('~/framework/util/storage/mmkv').mmkvInstance,
      migrations: require('~/framework/util/storage/migrations'),
      Storage: require('~/framework/util/storage').Storage,
      StorageHandler: require('~/framework/util/storage/storage-handler').StorageHandler,
    };
  });
  return modules;
};
