/**
 * Loads the stores of the auth module and their persistence the way the app has them at its startup: empty, not yet read from the
 * storage, on an empty fake device storage and with the platforms a test gives. These modules keep state (the stores, the
 * subscription of the persistence), so a test loads them again with `loadAuthModules()`.
 */

import type * as AccountStorageHandlerModule from '~/framework/util/storage/account-storage-handler';
import type { useAccountsStore as UseAccountsStore } from '~/modules/auth/store/accounts';
import type { initAccountsStore as InitAccountsStore } from '~/modules/auth/store/accounts-persistence';
import type { useSignInStore as UseSignInStore } from '~/modules/auth/store/sign-in';

import { type PlatformKind, setPlatforms } from './app-conf';
import type { FakeStorageLib } from './fake-storage-lib';
// Registers the fakes of the device storage and of the platforms (`jest.mock`), that these modules need
import './storage-modules';

export const loadAuthModules = ({ platforms = ['standard'] }: { platforms?: PlatformKind[] } = {}) => {
  let modules!: {
    AccountStorageHandler: (typeof AccountStorageHandlerModule)['AccountStorageHandler'];
    initAccountsStore: typeof InitAccountsStore;
    lib: FakeStorageLib;
    useAccountsStore: typeof UseAccountsStore;
    useSignInStore: typeof UseSignInStore;
  };
  jest.isolateModules(() => {
    // Inside: the fake platforms must be those of this set of modules
    setPlatforms(platforms);
    modules = {
      AccountStorageHandler: require('~/framework/util/storage/account-storage-handler').AccountStorageHandler,
      initAccountsStore: require('~/modules/auth/store/accounts-persistence').initAccountsStore,
      lib: require('~/framework/util/storage/mmkv').mmkvInstance,
      useAccountsStore: require('~/modules/auth/store/accounts').useAccountsStore,
      useSignInStore: require('~/modules/auth/store/sign-in').useSignInStore,
    };
  });
  return modules;
};
