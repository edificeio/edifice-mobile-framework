import type { AuthLoggedAccount } from '~/framework/modules/auth/model';

import type { IModuleConfig } from '../moduleTool';

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

/**
 * Storage that host differents keys with values
 */
export interface IStorageSlice<StorageTypes extends Record<StorageKey, string | number | boolean | any>> {
  computeKey(key: StorageStringKeys<StorageTypes>): StorageKey;
  contains(key: StorageStringKeys<StorageTypes>): boolean;
  delete(key: StorageStringKeys<StorageTypes>): void;
  getBoolean(key: KeysWithValueOfType<StorageTypes, boolean>): StorageTypes[KeysWithValueOfType<StorageTypes, boolean>] | undefined;
  getNumber(key: KeysWithValueOfType<StorageTypes, number>): StorageTypes[KeysWithValueOfType<StorageTypes, number>] | undefined;
  getString(key: KeysWithValueOfType<StorageTypes, string>): StorageTypes[KeysWithValueOfType<StorageTypes, string>] | undefined;
  getJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType,
  ): StorageTypes[typeof key] | undefined;
  set(key: KeysWithValueOfType<StorageTypes, boolean>, value: StorageTypes[KeysWithValueOfType<StorageTypes, boolean>]): void;
  set(key: KeysWithValueOfType<StorageTypes, number>, value: StorageTypes[KeysWithValueOfType<StorageTypes, number>]): void;
  set(key: KeysWithValueOfType<StorageTypes, string>, value: StorageTypes[KeysWithValueOfType<StorageTypes, string>]): void;
  setJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType,
    value: StorageTypes[typeof key],
  ): void;
  withPrefix(prefix: string): IStorageSlice<StorageTypes>;
  withModule<Name extends string>(module: IModuleConfig<Name, any>): IStorageSlice<StorageTypes>;
}

/**
 * Utilisty function to create a storage with init & migration
 */
export interface IStorageHandler<Storage extends IStorageBackend | IStorageSlice<StorageTypeMap>> {
  setAppInit(initFn: (this: ThisType<Storage>) => void): this;
  setSessionInit(initFn: (this: ThisType<Storage>, session: AuthLoggedAccount) => void): this;
}
