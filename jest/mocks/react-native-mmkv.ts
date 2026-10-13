/**
 * Replaces the package `react-native-mmkv` in every test (see `moduleNameMapper` of `jest.config.js`): the native MMKV can't run
 * in Node. The lib is the in-memory one of `src/test-utils/fake-storage-lib.ts`.
 */

import { createFakeStorageLib } from '~/test-utils/fake-storage-lib';

export const createMMKV = (config?: { id?: string }) => createFakeStorageLib(config);
