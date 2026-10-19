/**
 * Hooks to use the values of a storage in components: the component renders again when the value changes,
 * whoever changes it (the component itself, another one, a flow...). Same keys and types as the `get*` / `set*` of the handlers:
 * the keys given are checked and auto-completed from the type of the storage.
 *
 * Like `useState`, each one returns `[value, setValue]`. `value` is `undefined` while nothing is stored, and giving `undefined` to
 * `setValue` removes the value.
 *
 * The hooks of an account storage (`Storage.account`) work on an account found this way, in this order:
 * 1. the account of the storage when it is a view made by `storage.for(accountId)`;
 * 2. the account of the component, when it is wrapped by `withSession` (auth module): it does not change as long as the component is
 *    mounted;
 * 3. the current account.
 * Without any account, `value` is always `undefined` and `setValue` throws.
 */

import React from 'react';

import { useAccountStorageId } from './account-context';
import { AccountStorageHandler } from './account-storage-handler';
import { StorageHandler } from './storage-handler';
import type { KeysWithValueNotOfType, KeysWithValueOfType, StorageStringKeys, StorageTypeMap } from './types';

/**
 * The storage the hooks read and write: the given one, or for an account storage its view on the account (see the order above).
 * @returns undefined for an account storage when there is no account.
 */
const useStorageTarget = <Types extends StorageTypeMap>(storage: StorageHandler<Types>): StorageHandler<Types> | undefined => {
  const contextAccountId = useAccountStorageId();
  const boundOrContextId =
    storage instanceof AccountStorageHandler
      ? (storage.boundAccountId ?? contextAccountId ?? AccountStorageHandler.peekAccountId())
      : undefined;
  return React.useMemo(() => {
    if (!(storage instanceof AccountStorageHandler)) return storage;
    if (storage.boundAccountId !== undefined) return storage;
    return boundOrContextId === undefined ? undefined : storage.for(boundOrContextId);
  }, [storage, boundOrContextId]);
};

/**
 * Reads a value of the storage and subscribes to its changes. Without storage (no account) there is nothing to read.
 * @param read gives the value to render. It must give the same thing (`===`) as long as the stored value did not change.
 */
const useStorageValue = <Types extends StorageTypeMap, Value>(
  storage: StorageHandler<Types> | undefined,
  key: StorageStringKeys<Types>,
  read: (storage: StorageHandler<Types>) => Value,
) => {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!storage) return () => {};
      const listener = storage.addOnChangedListener(key, onChange);
      return () => listener.remove();
    },
    [storage, key],
  );
  return React.useSyncExternalStore(subscribe, () => (storage ? read(storage) : undefined));
};

/**
 * Setter of the value. Without storage (no account) it throws: there is nowhere to write.
 */
const useStorageSetter = <Types extends StorageTypeMap, Value>(
  storage: StorageHandler<Types> | undefined,
  key: StorageStringKeys<Types>,
  write: (storage: StorageHandler<Types>, value: Value) => void,
) =>
  React.useCallback(
    (value: Value | undefined) => {
      if (!storage) {
        throw new Error(
          '[Storage] Nothing can be written in an account storage without an account (see `withSession`, `for(accountId)`)',
        );
      }
      if (value === undefined) storage.remove(key);
      else write(storage, value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `write` only uses its parameters
    [storage, key],
  );

/** A boolean of the storage. */
export const useStorageBoolean = <Types extends StorageTypeMap, Key extends KeysWithValueOfType<Types, boolean>>(
  storage: StorageHandler<Types>,
  key: Key,
) => {
  const target = useStorageTarget(storage);
  const value = useStorageValue(target, key, handler => handler.getBoolean(key));
  const setValue = useStorageSetter<Types, boolean>(target, key, (handler, v) => handler.set(key, v as Types[Key]));
  return [value, setValue] as const;
};

/** A number of the storage. */
export const useStorageNumber = <Types extends StorageTypeMap, Key extends KeysWithValueOfType<Types, number>>(
  storage: StorageHandler<Types>,
  key: Key,
) => {
  const target = useStorageTarget(storage);
  const value = useStorageValue(target, key, handler => handler.getNumber(key));
  const setValue = useStorageSetter<Types, number>(target, key, (handler, v) => handler.set(key, v as Types[Key]));
  return [value, setValue] as const;
};

/** A string of the storage. */
export const useStorageString = <Types extends StorageTypeMap, Key extends KeysWithValueOfType<Types, string>>(
  storage: StorageHandler<Types>,
  key: Key,
) => {
  const target = useStorageTarget(storage);
  const value = useStorageValue(target, key, handler => handler.getString(key));
  const setValue = useStorageSetter<Types, string>(target, key, (handler, v) => handler.set(key, v as Types[Key]));
  return [value, setValue] as const;
};

/**
 * An object (or an array...) of the storage, saved as JSON.
 * The same object is given while the stored value does not change, so it can safely be a dependency of effects and memos.
 */
export const useStorageJSON = <Types extends StorageTypeMap, Key extends KeysWithValueNotOfType<Types, boolean | number | string>>(
  storage: StorageHandler<Types>,
  key: Key,
) => {
  const target = useStorageTarget(storage);
  // What is compared to know if the value changed is the saved string: parsing it gives a new object each time
  const json = useStorageValue(target, key, handler => handler.parent.getString(handler.computeKey(key)));
  const value = React.useMemo(() => StorageHandler.parseJSON<Types[Key]>(json, key), [json, key]);
  const setValue = useStorageSetter<Types, Types[Key]>(target, key, (handler, v) => handler.setJSON(key, v));
  return [value, setValue] as const;
};
