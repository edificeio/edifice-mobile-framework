/**
 * Persistence of the `accounts` store.
 *
 * The storage (MMKV) is the persisted version of the store: nobody writes in it directly.
 * - `initAccountsStore()` reads the storage once and fills the store.
 * - from then on, every change of the store is serialized back to the storage (zustand `subscribe`).
 */

import { Storage } from '~/framework/util/storage';
import {
  accountIsActive,
  accountIsLoggable,
  AuthMixedAccountMap,
  AuthSavedAccount,
  getSerializedLoggedInAccountInfo,
} from '~/modules/auth/model';
import {
  eraseStorageForAccount,
  readSavedAccounts,
  readSavedStartup,
  readShowWelcome,
  writeAccounts,
  writeShowWelcome,
  writeStartup,
} from '~/modules/auth/storage';

import { getActiveAccount, useAccountsStore } from './accounts';

/**
 * Tokens that are never persisted: they are fetched from the server at each login, or when needed.
 */
const stripVolatileTokens = <T extends AuthSavedAccount>(account: T): T => {
  if (!accountIsLoggable(account)) return account;
  const { carbonioToken: _carbonio, oneSessionId: _oneSession, queryParam: _queryParam, ...tokens } = account.tokens;
  return { ...account, tokens };
};

const serializeAccounts = (accounts: AuthMixedAccountMap) =>
  Object.fromEntries(
    Object.entries(accounts).map(([id, account]) => [
      id,
      stripVolatileTokens(accountIsActive(account) ? getSerializedLoggedInAccountInfo(account) : account),
    ]),
  ) as Record<string, AuthSavedAccount>;

// The preferences of the other modules belong to the active account.
Storage.setAccountResolver(() => getActiveAccount()?.user.id);

let unsubscribe: (() => void) | undefined;

/**
 * Reads the storage into the `accounts` store, then keeps the storage up to date with the store.
 * To be called once at app startup.
 * @returns the account to restore at startup if any, and the platform it was on.
 */
export const initAccountsStore = () => {
  const startup = readSavedStartup();
  const accounts: AuthMixedAccountMap = Object.fromEntries(
    Object.entries(readSavedAccounts()).map(([id, account]) => [id, stripVolatileTokens(account)]),
  );
  useAccountsStore.getState().hydrate(accounts, readShowWelcome(), startup);

  unsubscribe?.();
  // `startup` is a field of the store: it is only written when it changes, so a restore that did not work, or what happens meanwhile
  // (token refresh of another account, profile...), never touch it.
  unsubscribe = useAccountsStore.subscribe((state, prev) => {
    if (state.accounts !== prev.accounts) {
      writeAccounts(serializeAccounts(state.accounts));
      // An account that disappears (removed, or replaced by another one) takes its preferences with it.
      Object.keys(prev.accounts)
        .filter(id => !(id in state.accounts))
        .forEach(eraseStorageForAccount);
    }
    if (state.showWelcome !== prev.showWelcome) {
      writeShowWelcome(state.showWelcome);
    }
    if (state.startup !== prev.startup && JSON.stringify(state.startup) !== JSON.stringify(prev.startup)) {
      writeStartup(state.startup);
    }
  });

  const accountIds = Object.keys(accounts);
  const startupAccountId = startup.account ?? (accountIds.length === 1 ? accountIds[0] : undefined);
  return {
    account: startupAccountId !== undefined ? accounts[startupAccountId] : undefined,
    platform: startup.platform,
  };
};
