import { StorageHandler } from './storage-handler';
import type { StorageLib, StorageTypeMap } from './types';

export class AccountStorageHandler<StorageTypes extends StorageTypeMap = StorageTypeMap> extends StorageHandler<StorageTypes> {
  static PREFIX_ACCOUNT = '@';

  private static accountResolver: (() => string | undefined) | undefined;

  /**
   * Tells how to get the id of the current account. Called once, by the module that manages the accounts:
   * the storage does not know about accounts.
   */
  static setAccountResolver(resolver: () => string | undefined) {
    AccountStorageHandler.accountResolver = resolver;
  }

  /** Id of the current account, if there is one. */
  static peekAccountId(): string | undefined {
    return AccountStorageHandler.accountResolver?.();
  }

  /**
   * Id of the current account.
   * @throws if there is none: the data of an account can't be used without an account.
   */
  static currentAccountId(): string {
    const accountId = AccountStorageHandler.peekAccountId();
    if (accountId === undefined) throw new Error('[Storage] An account storage is used while there is no account');
    return accountId;
  }

  constructor(public parent: StorageLib | StorageHandler) {
    super(parent);
  }

  private accountId?: string | undefined;

  /** The account this handler is tied to, if it is a view made by `for(accountId)`. Otherwise it follows the current account. */
  get boundAccountId() {
    return this.accountId;
  }

  /**
   * The same storage, of the given account instead of the current one (which may be a different account, or none).
   * The returned handler is tied to this account: it is not affected by the account changes.
   */
  for(accountId: string) {
    const view = new AccountStorageHandler<StorageTypes>(this.parent);
    view.prefix = this.prefix;
    view.migrationEntries = this.migrationEntries;
    view.accountId = accountId;
    return view;
  }

  public walkPrefixes(given: [string | undefined, string[]] = [undefined, []]): [string | undefined, string[]] {
    const [childStart, childList] = super.walkPrefixes(given);
    const ret = [
      childStart ?? `${AccountStorageHandler.PREFIX_ACCOUNT}${this.accountId ?? AccountStorageHandler.currentAccountId()}`,
      childList,
    ] satisfies [string | undefined, string[]];
    return this.parent instanceof StorageHandler ? this.parent.walkPrefixes(ret) : ret;
  }
}
