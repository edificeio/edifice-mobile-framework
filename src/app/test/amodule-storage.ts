/**
 * Pilot of the storage API, with made-up data (for the `amodule` test module).
 * - `storage`: what belongs to the device.
 * - `preferences`: what belongs to the account.
 * Each one declares the migrations that bring data stored by a former version to the shape read here.
 */

import { Storage } from '~/framework/util/storage';

export interface AModuleStorageData {
  'launch-count': number;
  'last-launch'?: string;
}

/** Key a former version used (made up). */
const OLD_LAUNCH_COUNT_KEY = 'amodule-old.launchCount';

export const storage = Storage.device<AModuleStorageData>({
  migrations: [
    {
      id: 'launch-count-v1',
      run: handler => {
        const old = Storage.global.getString(OLD_LAUNCH_COUNT_KEY);
        if (old !== undefined) {
          handler.set('launch-count', Number(old));
          Storage.global.remove(OLD_LAUNCH_COUNT_KEY);
        }
      },
    },
  ],
  namespace: 'amodule',
});

export interface AModulePreferencesData {
  'favorite-number': number;
  'nickname'?: string;
}

/** Key a former version used (made up). */
const oldFavoriteNumberKey = (accountId: string) => `amodule-old.favoriteNumber.${accountId}`;

export const preferences = Storage.account<AModulePreferencesData>({
  migrations: [
    {
      id: 'favorite-number-v1',
      run: (handler, { accountId }) => {
        const key = oldFavoriteNumberKey(accountId);
        const old = Storage.global.getString(key);
        if (old !== undefined) {
          handler.set('favorite-number', Number(old));
          Storage.global.remove(key);
        }
      },
    },
  ],
  namespace: 'amodule',
});
