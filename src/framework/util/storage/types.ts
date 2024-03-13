export type StorageKey = string;

export type StorageTypeMap = { [key: StorageKey]: string | number | boolean | any };
export type StorageStringKeys<Map extends StorageTypeMap> = Extract<keyof Map, string>;
export type StorageStringKeysOfValueType<Map extends StorageTypeMap, U> = StorageStringKeys<Map> & KeysWithValueOfType<Map, U>;

export type KeysWithValueOfType<T extends StorageTypeMap, U> = {
  [K in StorageStringKeys<T>]: T[K] extends U ? K : never;
}[StorageStringKeys<T>];

export type KeysWithValueNotOfType<T extends StorageTypeMap, U> = {
  [K in StorageStringKeys<T>]: T[K] extends U ? never : K;
}[StorageStringKeys<T>];

/**
 * Low-level storage technology as MMKV provides
 */
export interface IStorageBackend {
  contains(key: StorageKey): boolean;
  delete(key: StorageKey): void;
  getBoolean(key: StorageKey): boolean | undefined;
  getNumber(key: StorageKey): number | undefined;
  getString(key: StorageKey): string | undefined;
  set(key: StorageKey, value: boolean | string | number): void;
  getAllKeys(): StorageKey[];
}
