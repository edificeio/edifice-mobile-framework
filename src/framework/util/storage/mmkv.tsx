import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import RNConfigReader from 'react-native-config-reader';
import { MMKV } from 'react-native-mmkv';

import { getOverrideName } from '~/framework/util/string';
import { Trackers } from '~/framework/util/tracker';

import { StorageBackend } from './backend';
import type { IStorageBackend } from './types';

/**
 * Migrate from AsyncStorage
 * - Find all existing AsyncStorage keys
 * - Launch migration script if some keys remain
 * - Get each key's value, add it to MMKV and remove it from AsyncStorage
 */
const migrateFromAsyncStorage = async (storage: IStorageBackend) => {
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

const mmkvInstance = new MMKV({
  id: getOverrideName(),
  encryptionKey: RNConfigReader.CFBundleIdentifier,
}) satisfies IStorageBackend;

const FlipperMMKV = __DEV__
  ? require('react-native-mmkv-flipper-plugin').initializeMMKVFlipper({ default: mmkvInstance })
  : undefined;
export const FlipperMMKVElement = FlipperMMKV ? <FlipperMMKV /> : null;

export const mmkvStorageHelper = new StorageBackend(mmkvInstance, 'mmkv').setAppInit(async function () {
  await migrateFromAsyncStorage(this);
});