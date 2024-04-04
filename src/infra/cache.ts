import { OldStorageFunctions } from '~/framework/util/storage';

export const CACHE_KEY_PREFIX = 'request-';

/**
 * Erase from MMKV all data that keeps requests cache.
 */
export async function clearRequestsCacheLegacy() {
  const keys = (await OldStorageFunctions.getKeys())?.filter(str => str.startsWith(CACHE_KEY_PREFIX));
  if (keys) await OldStorageFunctions.removeItems(keys);
}
