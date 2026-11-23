import { Platform } from 'react-native';

import { createMMKV } from 'react-native-mmkv';

import AppInfo from '~/framework/util/app-info';
import { getOverrideName } from '~/framework/util/string';

import { StorageHandler } from './handler';
import type { IStorageBackend } from './types';

export const mmkvInstance = createMMKV({
  encryptionKey: Platform.OS === 'ios' ? AppInfo.app.bundleId : undefined,
  id: getOverrideName(),
}) satisfies IStorageBackend;

export const mmkvHandler = new StorageHandler(mmkvInstance, 'mmkv').setAppInit(async function () {
  // Nothing to do here for the moment.
});
