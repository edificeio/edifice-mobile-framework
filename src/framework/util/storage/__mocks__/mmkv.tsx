/**
 * Replaces `mmkv.tsx` in tests (`jest.mock('~/framework/util/storage/mmkv')`). The real one needs React Native, the device info and
 * the build info of the app just to be created, none of which is the point of the tests of the storage: it is replaced as a whole,
 * on top of the fake `react-native-mmkv` (`jest/mocks/react-native-mmkv.ts`). Both exports have the same names as the real ones.
 * This file has the same name as the module it replaces, extension included (`mmkv.tsx`): Jest only finds the mock that way.
 */

import { createMMKV } from 'react-native-mmkv';

import type { FakeStorageLib } from '~/test-utils/fake-storage-lib';

import { StorageHandler } from '../storage-handler';

export const mmkvInstance = createMMKV({ id: 'test' }) as unknown as FakeStorageLib;

export const mmkvHandler = new StorageHandler(mmkvInstance);
