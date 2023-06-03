/**
 * Async Storage Helper
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItemJson = async <T>(k: string) => {
  try {
    const ret = await AsyncStorage.getItem(k);
    if (!ret) return undefined;
    else return JSON.parse(ret) as T;
  } catch (e) {
    if (e instanceof Error) throw new Error(`[Storage] getItemJson: failed to load key "${k}": ${(e as Error).message}`);
    else throw new Error(`[Storage] getItemJson: failed to load key "${k}"`);
  }
};

export const setItemJson = async <T>(k: string, data: T) => {
  try {
    return await AsyncStorage.setItem(k, JSON.stringify(data));
  } catch (e) {
    if (e instanceof Error) throw new Error(`[Storage] setItemJson: failed to write key "${k}": ${(e as Error).message}`);
    else throw new Error(`[Storage] setItemJson: failed to write key "${k}"`);
  }
};

export const removeItem = async (k: string) => {
  try {
    return await AsyncStorage.removeItem(k);
  } catch (e) {
    if (e instanceof Error) throw new Error(`[Storage] removeItemJson: failed to remove key "${k}": ${(e as Error).message}`);
    else throw new Error(`[Storage] removeItemJson: failed to remove key "${k}"`);
  }
};

/**
 * Rename and returns data at an old key and move it into a new key.
 * @param oldAsyncStorageKey old key to read. Data at this key will be removed.
 * @param newAsyncStorageKey new key to write.
 * @returns the data contained in oldKey, now written in newKey, or undefined if it was not present.
 */
export async function migrateItemJson<ItemType>(
  oldAsyncStorageKey: string,
  newAsyncStorageKey: string,
): Promise<ItemType | undefined> {
  const settingsToMigrate: ItemType | undefined = await getItemJson(oldAsyncStorageKey);
  if (settingsToMigrate) {
    await removeItem(oldAsyncStorageKey);
    return settingsToMigrate;
  } else return undefined;
}
