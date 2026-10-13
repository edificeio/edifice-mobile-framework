import { Platform } from 'react-native';

import { createMMKV } from 'react-native-mmkv';

import AppInfo from '~/framework/util/app-info';
import { getOverrideName } from '~/framework/util/string';

import { StorageHandler } from './storage-handler';
import type { StorageLib } from './types';

export const mmkvInstance = createMMKV({
  encryptionKey: Platform.OS === 'ios' ? AppInfo.app.bundleId : undefined,
  id: getOverrideName(),
}) satisfies StorageLib;

export const mmkvHandler = new StorageHandler(mmkvInstance);
