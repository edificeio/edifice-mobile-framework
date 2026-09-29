import type { AuthActiveAccount } from '~/framework/modules/auth/model';

import { KeysWithValueNotOfType, KeysWithValueOfType, StorageKey, StorageLib, StorageStringKeys, StorageTypeMap } from './types';

export class StorageHandler<StorageTypes extends StorageTypeMap = StorageTypeMap> implements StorageLib {
  static PREFIX_SEPARATOR = '.';

  /**
   * Type-only member (no implementation, stripped at compile time) to retrieve StorageTypes from any subclass instance.
   * @see StorageTypesOf
   */
  public __types?(): StorageTypes;

  constructor(
    public parent: StorageLib | StorageHandler,
    public name?: string,
  ) {}

  private prefix?: string | undefined;
  private onAppInit?: (() => Promise<void>) | undefined;

  setPrefix(prefix: string) {
    this.prefix = prefix;
    return this;
  }
  setAppInit(initFn?: (this: this) => Promise<void>) {
    this.onAppInit = initFn?.bind(this);
    return this;
  }

  private initDone = false;
  async init() {
    if (this.parent instanceof StorageHandler) this.parent.init();
    if (this.initDone) return;
    console.debug(`[Storage] init storage '${this.name ?? this.constructor.name}'`);
    await this.onAppInit?.();
    this.initDone = true;
  }

  public computeKey(key: StorageStringKeys<StorageTypes>): StorageKey {
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

  getBoolean(key: KeysWithValueOfType<StorageTypes, boolean>): boolean | undefined {
    const val = this.parent.getNumber(this.computeKey(key));
    if (val === StorageHandler.BOOL_FALSE) return false;
    else return true;
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
    const str = this.parent.getString(this.computeKey(key));
    return str ? JSON.parse(str) : undefined;
  }

  set(key: KeysWithValueOfType<StorageTypes, boolean>, value: StorageTypes[KeysWithValueOfType<StorageTypes, boolean>]): void;
  set(key: KeysWithValueOfType<StorageTypes, number>, value: StorageTypes[KeysWithValueOfType<StorageTypes, number>]): void;
  set(key: KeysWithValueOfType<StorageTypes, string>, value: StorageTypes[KeysWithValueOfType<StorageTypes, string>]): void;
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

  getAllKeys(): StorageKey[] {
    return this.parent.getAllKeys();
  }
}

export class PreferenceHandler<StorageTypes extends StorageTypeMap = StorageTypeMap> extends StorageHandler<StorageTypes> {
  static PREFIX_OWNER = '@';

  constructor(
    public parent: StorageLib | StorageHandler,
    public name?: string,
  ) {
    super(parent, name);
  }

  private owner?: string | undefined;

  /**
   * ONLY FOR DEBUGGING PURPOSE
   * @deprecated
   */
  setOwner(owner: string) {
    this.owner = owner;
    return this;
  }
  private onSessionInit?: ((session: AuthActiveAccount) => Promise<void>) | undefined;

  public walkPrefixes(given: [string | undefined, string[]] = [undefined, []]): [string | undefined, string[]] {
    const [childStart, childList] = super.walkPrefixes(given);
    const ret = [childStart ?? `${PreferenceHandler.PREFIX_OWNER}${this.owner}`, childList] satisfies [
      string | undefined,
      string[],
    ];
    return this.parent instanceof StorageHandler ? this.parent.walkPrefixes(ret) : ret;
  }

  setSessionInit(initFn?: (this: this, session: AuthActiveAccount) => Promise<void>) {
    this.onSessionInit = initFn?.bind(this);
    return this;
  }

  private sessionInitDone = new Set<AuthActiveAccount['user']['id']>();
  async sessionInit(session: AuthActiveAccount) {
    if (this.parent instanceof PreferenceHandler) this.parent.sessionInit(session);
    if (this.sessionInitDone.has(session.user.id)) return;
    console.debug(
      `[Storage] init preferences '${this.name ?? this.constructor.name} for ${PreferenceHandler.PREFIX_OWNER}${session.user.id}'`,
    );
    await this.onSessionInit?.(session);
    this.owner = session.user.id;
    this.sessionInitDone.add(session.user.id);
  }
}
