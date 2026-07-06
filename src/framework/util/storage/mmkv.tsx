import { Platform } from 'react-native';

import DeviveInfo from 'react-native-device-info';
import { createMMKV } from 'react-native-mmkv';

import { getOverrideName } from '~/framework/util/string';

import { StorageHandler } from './handler';
import type { IStorageBackend } from './types';

export const mmkvInstance = createMMKV({
  encryptionKey: Platform.OS === 'ios' ? DeviveInfo.getBundleId() : undefined,
  id: getOverrideName(),
}) satisfies IStorageBackend;

export const mmkvHandler = new StorageHandler(mmkvInstance, 'mmkv').setAppInit(async function () {
  // Nothing to do here for the moment.
});
