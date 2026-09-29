import { Platform } from 'react-native';

import DeviveInfo from 'react-native-device-info';
import { createMMKV } from 'react-native-mmkv';

import { getOverrideName } from '~/framework/util/string';

import { StorageHandler } from './handler';
import type { StorageLib } from './types';

export const mmkvInstance = createMMKV({
  encryptionKey: Platform.OS === 'ios' ? DeviveInfo.getBundleId() : undefined,
  id: getOverrideName(),
}) satisfies StorageLib;

export const mmkvHandler = new StorageHandler(mmkvInstance, 'mmkv').setAppInit(async function () {
  // Here goes any global migration
  // But there is nothing for now
});
