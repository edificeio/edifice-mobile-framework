export type StorageKey = string;

export type StorageTypeMap = { [key: StorageKey]: string | number | boolean | any };
export type StorageStringKeys<Map extends StorageTypeMap> = Extract<keyof Map, string>;

/**
 * Keys whose value is of type `U`. A key that may be missing or null (`'key'?: string`, `'key': string | null`) counts as
 * its type (`string`): nothing stored just reads `undefined`.
 */
export type KeysWithValueOfType<T extends StorageTypeMap, U> = {
  [K in StorageStringKeys<T>]: NonNullable<T[K]> extends U ? K : never;
}[StorageStringKeys<T>];

/** Keys whose value is NOT of type `U`, with the same rule about missing and null values as `KeysWithValueOfType`. */
export type KeysWithValueNotOfType<T extends StorageTypeMap, U> = {
  [K in StorageStringKeys<T>]: NonNullable<T[K]> extends U ? never : K;
}[StorageStringKeys<T>];

/**
 * Low-level storage technology as MMKV provides
 */
export interface StorageLib {
  contains(key: StorageKey): boolean;
  remove(key: StorageKey): void;
  getBoolean(key: StorageKey): boolean | undefined;
  getNumber(key: StorageKey): number | undefined;
  getString(key: StorageKey): string | undefined;
  set(key: StorageKey, value: boolean | string | number): void;
  getAllKeys(): StorageKey[];
  /** Calls the listener with the key of any value that is set or removed. */
  addOnValueChangedListener(listener: (key: StorageKey) => void): { remove: () => void };
}
