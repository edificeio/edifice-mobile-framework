/**
 * Persistence of the `accounts` store.
 *
 * The storage (MMKV) is the persisted version of the store: nobody writes in it directly.
 * - `initAccountsStore()` reads the storage once and fills the store.
 * - from then on, every change of the store is serialized back to the storage (zustand `subscribe`).
 */

import appConf from '~/framework/util/appConf';
import { Storage } from '~/framework/util/storage';
import {
  accountIsActive,
  accountIsLoggable,
  AccountType,
  ANONYMOUS_ACCOUNT_ID,
  AuthMixedAccountMap,
  AuthSavedAccount,
  getSerializedLoggedInAccountInfo,
} from '~/modules/auth/model';
import {
  AuthStorageData,
  eraseStorageForAccount,
  readSavedAccounts,
  readSavedStartup,
  readShowWelcome,
  writeAccounts,
  writeShowWelcome,
  writeStartup,
} from '~/modules/auth/storage';

import { getActiveAccount, useAccountsStore } from './accounts';
import { useSignInStore } from './sign-in';

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

/**
 * The `startup` to persist: the account (and platform) to restore at next launch.
 * It is the connected account; without any, it is the one the sign-in is waiting to restore (`restore` status).
 * So an account the user just left for another one that could not be restored is the one coming back at next launch.
 */
const getStartup = (): AuthStorageData['startup'] | undefined => {
  const { accounts, connected } = useAccountsStore.getState();
  const status = useSignInStore.getState().status;
  const accountId = connected ?? (status?.type === 'restore' ? status.accountId : undefined);
  const account = accountId !== undefined ? accounts[accountId] : undefined;
  if (account)
    return { account: account.user.id, platform: typeof account.platform === 'string' ? account.platform : account.platform.name };
  return connected === undefined && status?.type === 'restore' ? { platform: status.platform } : undefined;
};

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
  const anonymous = getAnonymousAccount(startup);
  if (anonymous) accounts[ANONYMOUS_ACCOUNT_ID] = anonymous;
  useAccountsStore.getState().hydrate(accounts, readShowWelcome());

  unsubscribe?.();
  // `startup` is only written when what it is made of changes: other changes of the stores don't touch it,
  // so a pending restore survives them.
  let lastStartup = JSON.stringify(getStartup());
  const syncStartup = () => {
    const startupToWrite = getStartup();
    const key = JSON.stringify(startupToWrite);
    if (key === lastStartup) return;
    lastStartup = key;
    writeStartup(startupToWrite);
  };
  const unsubscribeAccounts = useAccountsStore.subscribe((state, prev) => {
    if (state.accounts !== prev.accounts) {
      writeAccounts(serializeAccounts(state.accounts));
      // An account that disappears (removed, or replaced by another one) takes its preferences with it.
      Object.keys(prev.accounts)
        .filter(id => !(id in state.accounts) && id !== ANONYMOUS_ACCOUNT_ID)
        .forEach(eraseStorageForAccount);
    }
    if (state.showWelcome !== prev.showWelcome) {
      writeShowWelcome(state.showWelcome);
    }
    syncStartup();
  });
  const unsubscribeSignIn = useSignInStore.subscribe((state, prev) => {
    if (state.status !== prev.status) syncStartup();
  });
  unsubscribe = () => {
    unsubscribeAccounts();
    unsubscribeSignIn();
  };

  const accountIds = Object.keys(accounts);
  const startupAccountId = anonymous
    ? ANONYMOUS_ACCOUNT_ID
    : (startup.account ?? (accountIds.length === 1 ? accountIds[0] : undefined));
  return {
    account: startupAccountId !== undefined ? accounts[startupAccountId] : undefined,
    platform: startup.platform,
  };
};
