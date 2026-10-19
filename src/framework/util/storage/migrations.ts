/**
 * Storage migrations: one-shot steps that bring data stored by a former version of the app to the shape the current one reads
 * (move a value from an old key to a new one, remove a key that is not used anymore...).
 *
 * A migration is declared on the storage it works on, when the storage is created (`Storage.device` / `Storage.account`), and
 * the storage is declared in the `storages` of the module that owns it: the app startup (`StorageProvider`) takes in charge the
 * storages the modules declare: it marks them declared, then runs their migrations. A storage that has migrations and that no module declares
 * throws when it is used (see `StorageHandler.declaredMigrationScopes`). Each migration runs ONCE: the first time it succeeds, a marker is saved. A migration
 * that throws is logged and tried again next time (so it must be safe to run again from the start).
 *
 * - Migrations of a `Storage.device` storage work on what belongs to the device. They run at the app startup, before anything reads
 *   the storage.
 * - Migrations of a `Storage.account` storage work on what belongs to an account. They run at the app startup for every
 *   saved account, and for each account added afterwards (before it is signed in): the data of any known account is always
 *   migrated, whichever way it is read (`for(accountId)` or the current account). The marker is saved among the data of the
 *   account, so it goes away with them.
 *
 * A migration is identified by its `id` among the ones of the same namespace. Never change it once released.
 */

import { AccountStorageHandler } from './account-storage-handler';
import { mmkvHandler } from './mmkv';
import { StorageHandler } from './storage-handler';

export interface DeviceStorageMigration<Handler extends StorageHandler<any> = StorageHandler> {
  /** Unique among the migrations of the namespace, and never changed (it is what tells the migration was done). */
  id: string;
  /** `storage` is the one the migration is declared on, to write the new values. Old keys are read with `Storage.global`. */
  run: (storage: Handler) => void | Promise<void>;
}

export interface AccountStorageMigration<Handler extends AccountStorageHandler<any> = AccountStorageHandler> {
  /** Unique among the migrations of the namespace, and never changed (it is what tells the migration was done). */
  id: string;
  /** `storage` is the one the migration is declared on, tied to the account given (see `AccountStorageHandler.for`). */
  run: (storage: Handler, context: { accountId: string }) => void | Promise<void>;
}

/**
 * One migration, ready to run: `run` already knows the storage it works on.
 * A device one is run as is, an account one with the id of the account.
 */
export type MigrationEntry =
  | { type: 'device'; namespace: string; id: string; run: () => void | Promise<void> }
  | { type: 'account'; namespace: string; id: string; run: (accountId: string) => void | Promise<void> };

/**
 * Where the markers of the migrations that were done are saved: `$migration.<namespace>.<id>` for the device,
 * and `@<accountId>.$migration.<namespace>.<id>` for an account (so they go away with its data).
 * The keys are computed by the handlers, like any other key.
 */
const MARKER_PREFIX = '$migration';
const deviceMarkers = new StorageHandler(mmkvHandler).setPrefix(MARKER_PREFIX);
const accountMarkers = new AccountStorageHandler(mmkvHandler).setPrefix(MARKER_PREFIX);

const markerOf = ({ id, namespace }: MigrationEntry) => `${namespace}${StorageHandler.PREFIX_SEPARATOR}${id}`;
const nameOf = (entry: MigrationEntry, accountId?: string) =>
  `'${markerOf(entry)}'${accountId === undefined ? '' : ` for ${accountId}`}`;

const runEntry = async (entry: MigrationEntry, accountId?: string) => {
  const markers = entry.type === 'account' ? accountMarkers.for(accountId!) : deviceMarkers;
  if (markers.contains(markerOf(entry))) return;
  try {
    console.debug(`[Storage] migration ${nameOf(entry, accountId)}`);
    await (entry.type === 'account' ? entry.run(accountId!) : entry.run());
    markers.set(markerOf(entry), true);
  } catch (e) {
    console.error(`[Storage] migration ${nameOf(entry, accountId)} failed, it will be tried again next time :`, e);
  }
};

/** The storages with migrations that the modules declare, known once the startup migrations were launched. */
let declaredStorages: readonly StorageHandler<any>[] = [];
let devicePromise: Promise<void> | undefined;

/**
 * Marks the storages that the modules declare, and runs the migrations of the ones of the device (once, whoever calls it, and as many times as
 * it is called).
 * @param storages every storage the modules declare (a storage may be declared by several modules). Only the ones that have migrations matter.
 * @throws if two migrations of the same namespace have the same id.
 */
export const runDeviceMigrations = (storages: readonly StorageHandler<any>[]) => {
  devicePromise ??= (async () => {
    // A storage that several modules depend on is declared by each of them, but is the same one: migrated once
    declaredStorages = [...new Set(storages)].filter(storage => storage.migrations.length > 0);
    const ids = new Set<string>();
    for (const entry of declaredStorages.flatMap(storage => storage.migrations)) {
      const id = `${StorageHandler.migrationScopeOf(entry)}${StorageHandler.PREFIX_SEPARATOR}${entry.id}`;
      if (ids.has(id))
        throw new Error(`[Storage] Two migrations of the namespace '${entry.namespace}' have the same id '${entry.id}'`);
      ids.add(id);
    }
    for (const storage of declaredStorages) {
      // Marked first: the migrations write with the handler of the storage, which checks that it is declared
      StorageHandler.markDeclared(storage);
      for (const entry of storage.migrations) if (entry.type === 'device') await runEntry(entry);
    }
  })();
  return devicePromise;
};

/**
 * Runs the migrations of the account storages that were not done yet for the given account, in the order the modules declare them.
 */
export const runAccountMigrations = async (accountId: string) => {
  for (const entry of declaredStorages.flatMap(storage => storage.migrations)) {
    if (entry.type === 'account') await runEntry(entry, accountId);
  }
};
