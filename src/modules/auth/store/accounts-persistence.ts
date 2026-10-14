/**
 * Persistence of the `accounts` store.
 *
 * The storage (MMKV) is the persisted version of the store: nobody writes in it directly.
 * - `initAccountsStore()` reads the storage once and fills the store.
 * - from then on, every change of the store is serialized back to the storage (zustand `subscribe`).
 */

import appConf from '~/framework/util/appConf';

import {
  accountIsActive,
  accountIsLoggable,
  AccountType,
  ANONYMOUS_ACCOUNT_ID,
  AuthMixedAccountMap,
  AuthSavedAccount,
  getSerializedLoggedInAccountInfo,
} from '../model';
import {
  AuthStorageData,
  eraseAccountPreferences,
  readSavedAccounts,
  readSavedStartup,
  writeAccounts,
  writeStartup,
} from '../storage';
import { useAccountsStore } from './accounts';

/** Pre-1.12 versions only saved a token, to which we give an anonymous account to be restored. */
const getAnonymousAccount = (startup: AuthStorageData['startup']): AuthSavedAccount | undefined => {
  const platform = startup.platform ? appConf.getExpandedPlatform(startup.platform) : undefined;
  if (!startup.anonymousToken || !platform) return undefined;
  return {
    addTimestamp: 0,
    method: undefined,
    platform: platform.name,
    tokens: {
      access: {
        expiresAt: startup.anonymousToken.expires_at.toString(),
        type: startup.anonymousToken.token_type as 'Bearer',
        value: startup.anonymousToken.access_token,
      },
      origin: platform.url,
      refresh: { value: startup.anonymousToken.refresh_token },
      scope: startup.anonymousToken.scope.split(' '),
    },
    user: { displayName: '', id: ANONYMOUS_ACCOUNT_ID, loginUsed: '', type: AccountType.Guest },
  } as AuthSavedAccount;
};

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
    Object.entries(accounts)
      .filter(([id]) => id !== ANONYMOUS_ACCOUNT_ID) // Anonymous account only exists to be migrated, never saved
      .map(([id, account]) => [
        id,
        stripVolatileTokens(accountIsActive(account) ? getSerializedLoggedInAccountInfo(account) : account),
      ]),
  ) as Record<string, AuthSavedAccount>;

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
  const anonymous = getAnonymousAccount(startup);
  if (anonymous) accounts[ANONYMOUS_ACCOUNT_ID] = anonymous;
  useAccountsStore.getState().hydrate(accounts);

  unsubscribe?.();
  unsubscribe = useAccountsStore.subscribe((state, prev) => {
    if (state.accounts !== prev.accounts) {
      writeAccounts(serializeAccounts(state.accounts));
    }
    // `startup` (account to restore at next launch) only follows the connected account:
    // it is not touched by other changes, so a pending restore survives them.
    if (state.connected !== prev.connected) {
      const connected = state.connected !== undefined ? state.accounts[state.connected] : undefined;
      writeStartup(
        connected
          ? {
              account: connected.user.id,
              platform: typeof connected.platform === 'string' ? connected.platform : connected.platform.name,
            }
          : undefined,
      );
    }
    if (state.lastDeletedAccount !== undefined && state.lastDeletedAccount !== prev.lastDeletedAccount) {
      eraseAccountPreferences(state.lastDeletedAccount);
    }
  });

  const accountIds = Object.keys(accounts);
  const startupAccountId = anonymous
    ? ANONYMOUS_ACCOUNT_ID
    : (startup.account ?? (accountIds.length === 1 ? accountIds[0] : undefined));
  return {
    account: startupAccountId !== undefined ? accounts[startupAccountId] : undefined,
    platform: startup.platform,
  };
};
