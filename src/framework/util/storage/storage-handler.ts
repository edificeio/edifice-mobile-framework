import type { MigrationEntry } from './migrations';
import { KeysWithValueNotOfType, KeysWithValueOfType, StorageKey, StorageLib, StorageStringKeys, StorageTypeMap } from './types';

/**
 * Subscribers to the changes of a key, for all the storages that work on the same storage lib. They share a single listener of the
 * lib (native for MMKV): a change calls only the subscribers of its key, however many components use the storage.
 */
interface KeyListeners {
  byKey: Map<StorageKey, Set<() => void>>;
  lib?: { remove: () => void };
}
const keyListenersOfLib = new WeakMap<StorageLib, KeyListeners>();

export class StorageHandler<StorageTypes extends StorageTypeMap = StorageTypeMap> implements StorageLib {
  static PREFIX_SEPARATOR = '.';

  /**
   * Type-only member (no implementation, stripped at compile time): it is where TypeScript finds `StorageTypes` of any handler,
   * subclasses included (`AccountStorageHandler`), when a function takes a `StorageHandler<Types>` and infers `Types`
   * (see the hooks). Without it the inference depends on the shape of the methods and may fail with `never` keys.
   */
  public __types?(): StorageTypes;

  constructor(public parent: StorageLib | StorageHandler) {}

  /** The migrations declared with the storage (see `Storage.device`). Internal: run by `migrations.ts`. */
  protected migrationEntries: MigrationEntry[] = [];

  /** Internal: used by the storage factories. */
  setMigrations(entries: MigrationEntry[]) {
    this.migrationEntries = entries;
    return this;
  }

  /** Internal: used by `migrations.ts`. */
  get migrations(): readonly MigrationEntry[] {
    return this.migrationEntries;
  }

  /**
   * What identifies the migrations of a storage: the kind of storage (device or account) and its namespace.
   * Internal: used by `migrations.ts`.
   */
  static migrationScopeOf({ namespace, type }: Pick<MigrationEntry, 'namespace' | 'type'>) {
    return `${type}:${namespace}`;
  }

  /**
   * The storages that have migrations and that a module declares, identified by `migrationScopeOf` (kind + namespace) and not by
   * the handler itself. The startup marks them as soon as it takes them in charge, BEFORE it runs their migrations: a migration
   * writes with the handler of its storage, which goes through the check of `computeKey`.
   *
   * Why an index by namespace, shared by all the handlers, and not a flag on each one: in development, Fast Refresh evaluates again
   * the file of a storage when it is edited, which creates a NEW handler for the same storage (and a new module that declares it),
   * while the startup (which marks the storages) does not run again. A flag on the handler would leave that new one unmarked, and
   * its use would throw a misleading "no module declares it" until the app is fully reloaded. The storage is the same, only its
   * handler is new: the namespace is what stays the same.
   * In production a file is evaluated once, so it makes no difference there.
   */
  private static declaredMigrationScopes = new Set<string>();

  /** Marks the storage as declared by a module. Internal: used by `migrations.ts`. */
  static markDeclared(storage: StorageHandler<any>) {
    StorageHandler.declaredMigrationScopes.add(StorageHandler.migrationScopeOf(storage.migrations[0]));
  }

  protected prefix?: string | undefined;

  /** What the keys of the storage start with (see `Storage.device`). */
  setPrefix(prefix: string) {
    this.prefix = prefix;
    return this;
  }

  public computeKey(key: StorageStringKeys<StorageTypes>): StorageKey {
    // Every access to a key goes through here. A storage with migrations is only taken in charge by the startup (which runs its migrations) if a module declares
    // it: if not, this is the mistake of its developer, who must be told.
    if (
      this.migrationEntries.length > 0 &&
      !StorageHandler.declaredMigrationScopes.has(StorageHandler.migrationScopeOf(this.migrationEntries[0]))
    ) {
      throw new Error(
        `[Storage] '${this.migrationEntries[0].namespace}' has migrations, but no module declares it: add it to the \`storages\` of the module that owns it.`,
      );
    }
    const [start, prefixes] = this.walkPrefixes();
    if (start) prefixes.unshift(start);
    prefixes.push(key);
    return prefixes.join(StorageHandler.PREFIX_SEPARATOR);
  }

  public walkPrefixes([childStart, childList]: [string | undefined, string[]] = [undefined, []]): [string | undefined, string[]] {
    const ret = [childStart, this.prefix ? [...childList, this.prefix] : childList] satisfies [string | undefined, string[]];
    return this.parent instanceof StorageHandler ? this.parent.walkPrefixes(ret) : ret;
  }

  static BOOL_FALSE = 0;
  static BOOL_TRUE = 1;

  contains(key: StorageStringKeys<StorageTypes>): boolean {
    return this.parent.contains(this.computeKey(key));
  }

  remove(key: StorageStringKeys<StorageTypes>): void {
    return this.parent.remove(this.computeKey(key));
  }

  /**
   * @returns `undefined` when nothing is stored.
   *
   * Before the namespaces and the `Storage.device` / `Storage.account` API, a missing boolean was read as `true`
   * (`getBoolean` returned `true` for any key without a stored value). It now is `undefined`, as it should.
   * The readers that depended on the former result were adapted to give the same value as before (`?? true`), see
   * `readShowAllApps` (myapps) and the screen of the competences (`show-average-colors`).
   */
  getBoolean(key: KeysWithValueOfType<StorageTypes, boolean>): boolean | undefined {
    const val = this.parent.getNumber(this.computeKey(key));
    if (val === undefined) return undefined;
    return val !== StorageHandler.BOOL_FALSE;
  }

  getNumber(key: KeysWithValueOfType<StorageTypes, number>): number | undefined {
    return this.parent.getNumber(this.computeKey(key));
  }

  getString(key: KeysWithValueOfType<StorageTypes, string>): string | undefined {
    return this.parent.getString(this.computeKey(key));
  }

  getJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType,
  ): StorageTypes[typeof key] | undefined {
    return StorageHandler.parseJSON<StorageTypes[typeof key]>(this.parent.getString(this.computeKey(key)), key);
  }

  /**
   * Parses a value saved as JSON. Nothing saved, or a saved value that is not valid JSON (corrupted data), gives `undefined`:
   * a corrupted value must not make the app crash each time it is read.
   * @param label what is read, for the log
   */
  static parseJSON<Value>(raw: string | undefined, label: string): Value | undefined {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as Value;
    } catch (e) {
      console.error(`[Storage] The value of '${label}' is not valid JSON, it is ignored :`, e);
      return undefined;
    }
  }

  set<Key extends KeysWithValueOfType<StorageTypes, boolean>>(key: Key, value: NonNullable<StorageTypes[Key]>): void;
  set<Key extends KeysWithValueOfType<StorageTypes, number>>(key: Key, value: NonNullable<StorageTypes[Key]>): void;
  set<Key extends KeysWithValueOfType<StorageTypes, string>>(key: Key, value: NonNullable<StorageTypes[Key]>): void;
  set(key: StorageStringKeys<StorageTypes>, value: boolean | number | string): void {
    if (typeof value === 'boolean') {
      return this.parent.set(this.computeKey(key), value ? StorageHandler.BOOL_TRUE : StorageHandler.BOOL_FALSE);
    } else return this.parent.set(this.computeKey(key), value);
  }

  setJSON<KeyType extends KeysWithValueNotOfType<StorageTypes, boolean | number | string>>(
    key: KeyType,
    value: StorageTypes[typeof key],
  ): void {
    const str = JSON.stringify(value);
    this.parent.set(this.computeKey(key), str ?? '');
  }

  /** The (full) keys of this storage: the ones that start with its prefixes (all the keys of the device for the root storage). */
  getAllKeys(): StorageKey[] {
    // The full key of the empty key is the start of all the keys of the storage
    const start = this.computeKey('' as StorageStringKeys<StorageTypes>);
    return this.parent.getAllKeys().filter(k => k.startsWith(start));
  }

  /**
   * Calls the listener with the (full) key of any value that is set or removed in the device, whichever storage it belongs to.
   * Prefer `addOnChangedListener`, which only calls for the key of this storage that is given.
   */
  addOnValueChangedListener(listener: (key: StorageKey) => void) {
    return this.parent.addOnValueChangedListener(listener);
  }

  /** The lib at the root of the storages this one is made on (MMKV). */
  private get rootLib(): StorageLib {
    return this.parent instanceof StorageHandler ? this.parent.rootLib : this.parent;
  }

  /**
   * Calls the listener when the value of the key is set or removed (by anyone using the same device storage).
   * The full key is computed now: for an account storage it is the one of the account at this moment (use `for(accountId)`).
   */
  addOnChangedListener(key: StorageStringKeys<StorageTypes>, listener: () => void) {
    const fullKey = this.computeKey(key);
    const lib = this.rootLib;
    let listeners = keyListenersOfLib.get(lib);
    if (!listeners) keyListenersOfLib.set(lib, (listeners = { byKey: new Map() }));
    const { byKey } = listeners;
    const forKey = byKey.get(fullKey) ?? new Set<() => void>();
    byKey.set(fullKey, forKey);
    forKey.add(listener);
    // A single listener of the lib serves all the keys, while there is something to listen to
    listeners.lib ??= lib.addOnValueChangedListener(changedKey => byKey.get(changedKey)?.forEach(l => l()));

    return {
      remove: () => {
        forKey.delete(listener);
        if (forKey.size === 0) byKey.delete(fullKey);
        if (byKey.size === 0 && listeners.lib) {
          listeners.lib.remove();
          listeners.lib = undefined;
        }
      },
    };
  }
}
