import { createMockMMKV } from 'react-native-mmkv/lib/createMMKV/createMockMMKV';

import type { StorageKey, StorageLib } from '~/framework/util/storage/types';

export interface FakeStorageLib extends StorageLib {
  /** Everything stored, as it is in the lib (booleans are numbers: the handlers store them so). A copy: to change it, use `set`. */
  readonly data: Map<StorageKey, string | number | boolean>;
  /** Number of listeners installed on the lib (the handlers share one). */
  listenerCount: () => number;
  /** Forgets everything stored, and removes the listeners. */
  reset: () => void;
}

/**
 * An in-memory `StorageLib`, instead of MMKV: the mock that `react-native-mmkv` itself provides for tests (`createMockMMKV`, which
 * notifies its listeners like MMKV does), with what the tests need to look at what happened.
 */
export const createFakeStorageLib = (config?: { id?: string }): FakeStorageLib => {
  const mmkv = createMockMMKV(config as Parameters<typeof createMockMMKV>[0]);
  const subscriptions = new Set<{ remove: () => void }>();
  return {
    addOnValueChangedListener: listener => {
      const subscription = mmkv.addOnValueChangedListener(listener);
      const tracked = {
        remove: () => {
          subscription.remove();
          subscriptions.delete(tracked);
        },
      };
      subscriptions.add(tracked);
      return tracked;
    },
    contains: key => mmkv.contains(key),
    get data() {
      return new Map(
        mmkv.getAllKeys().map(key => [key, (mmkv.getString(key) ?? mmkv.getNumber(key) ?? mmkv.getBoolean(key))!] as const),
      );
    },
    getAllKeys: () => mmkv.getAllKeys(),
    getBoolean: key => mmkv.getBoolean(key),
    getNumber: key => mmkv.getNumber(key),
    getString: key => mmkv.getString(key),
    listenerCount: () => subscriptions.size,
    remove: key => {
      mmkv.remove(key);
    },
    reset: () => {
      [...subscriptions].forEach(subscription => subscription.remove());
      mmkv.clearAll();
    },
    set: (key, value) => mmkv.set(key, value),
  };
};
