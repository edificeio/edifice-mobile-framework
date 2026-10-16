/**
 * Compatibility layer of the former auth redux reducer.
 * The auth state now lives in the zustand stores of `~/modules/auth/store`.
 * Everything below is kept for the not yet migrated modules, reads the zustand stores, and is deprecated.
 *
 * @deprecated use the stores of `~/modules/auth/store` directly.
 */

import type { IGlobalState } from '~/app/store';
import type { HostId, Platform } from '~/framework/util/appConf';
import {
  assertSession as assertStoreSession,
  getConnectedAccount,
  getSession as getStoreSession,
  useAccountsStore,
} from '~/modules/auth/store/accounts';
import { getPlatformContext as getStorePlatformContext, usePlatformContextStore } from '~/modules/auth/store/platform-context';
import {
  getPlatformLegalUrls as getStorePlatformLegalUrls,
  usePlatformLegalUrlsStore,
} from '~/modules/auth/store/platform-legal-urls';
import { getPlatformReactionTypes } from '~/modules/auth/store/platform-reaction-types';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import type { AuthState } from './types';

/**
 * Builds the former redux state shape from the zustand stores. The given redux state is ignored.
 * @deprecated use `useAccountsStore`, `usePlatformContextStore`, `usePlatformLegalUrlsStore`, `useSignInStore` from `~/modules/auth/store/*` depending on the field you need.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getState = (_state?: IGlobalState): AuthState => {
  const { accounts, connected, lastAddAccount, lastDeletedAccount } = useAccountsStore.getState();
  const session = getStoreSession();
  return {
    accounts,
    connected,
    deviceInfo: {},
    error: useSignInStore.getState().error,
    lastAddAccount,
    lastDeletedAccount,
    pending: undefined,
    platformContexts: usePlatformContextStore.getState().contexts,
    platformLegalUrls: usePlatformLegalUrlsStore.getState().urls,
    requirement: getConnectedAccount()?.requirement,
    showOnboarding: true,
    validReactionTypes: getPlatformReactionTypes(session?.platform.name) ?? [],
  } as AuthState;
};

/**
 * These selectors are NOT reactive : they read zustand whenever the redux store updates.
 * They are kept as is for components not yet migrated.
 */
export const selectors = {
  /** @deprecated use `useAccountsStore(s => s.accounts)`. */
  accounts: () => useAccountsStore.getState().accounts,
  /** @deprecated use `useAccountsStore(s => s.connected)`. */
  connected: () => useAccountsStore.getState().connected,
  /** @deprecated use `usePlatformContext(name)` from `~/modules/auth/store/platform-context`. */
  hostContext: (name: HostId) => () => getStorePlatformContext(name),
  /** @deprecated use `useAccountsStore(s => s.lastAddAccount)`. */
  lastAddAccount: () => useAccountsStore.getState().lastAddAccount,
  /** @deprecated use `useAccountsStore(s => s.lastDeletedAccount)`. */
  lastDeletedAccount: () => useAccountsStore.getState().lastDeletedAccount,
  /** @deprecated use `useSignInStore(s => s.status)`. */
  pending: () => undefined,
  /** @deprecated use `useAccountWithRequirement()` from `~/modules/auth/store/accounts`. */
  requirement: () => getConnectedAccount()?.requirement,
  /** @deprecated use `useSession()` from `~/modules/auth/store/accounts`. */
  session: () => getStoreSession(),
  /** @deprecated onboarding is always shown. */
  showOnboarding: () => true,
};

/** @deprecated use `getSession()` from `~/modules/auth/store/accounts`, or the hook `useSession()` in components. */
export const getSession = () => getStoreSession();

/** @deprecated use `assertSession()` from `~/modules/auth/store/accounts`. */
export const assertSession = () => assertStoreSession();

/** @deprecated use `getSession()?.platform` from `~/modules/auth/store/accounts`. */
export function getPlatform() {
  return getSession()?.platform;
}

/**
 * get the platform context of the authentified user.
 * @deprecated use `getPlatformContext(platformName)` from `~/modules/auth/store/platform-context`.
 */
export function getPlatformContext() {
  return getStorePlatformContext(getSession()?.platform.name);
}

/**
 * get the platform context of the given platform
 * @deprecated use `getPlatformContext(platformName)` from `~/modules/auth/store/platform-context`.
 */
export function getPlatformContextOf(platform?: Platform) {
  return getStorePlatformContext(platform?.name);
}

/** @deprecated use `getPlatformLegalUrls(platformName)` from `~/modules/auth/store/platform-legal-urls`. */
export function getPlatformLegalUrls() {
  return getStorePlatformLegalUrls(getSession()?.platform.name);
}

/** @deprecated use `getPlatformLegalUrls(platformName)` from `~/modules/auth/store/platform-legal-urls`. */
export function getPlatformLegalUrlsOf(platform?: Platform) {
  return getStorePlatformLegalUrls(platform?.name);
}

/** @deprecated use `getPlatformReactionTypes(platformName)` from `~/modules/auth/store/platform-reaction-types`. */
export function getValidReactionTypes() {
  return getPlatformReactionTypes(getSession()?.platform.name) ?? [];
}

/** @deprecated use `Object.keys(useAccountsStore.getState().accounts).length`. */
export function getAccountsNumber() {
  return Object.keys(useAccountsStore.getState().accounts).length;
}

/** @deprecated use `Object.values(useAccountsStore.getState().accounts)`. */
export function getAccounts() {
  return Object.values(useAccountsStore.getState().accounts);
}

/** @deprecated use `useAccountsStore.getState().accounts[id]`. */
export function getAccountById(id?: keyof AuthState['accounts']) {
  return id ? useAccountsStore.getState().accounts[id] : undefined;
}

/**
 * Gets the currently stored query param token. Do NOT refresh it if expired.
 * Please use `getQueryParamToken` in `oauth.ts` instead.
 * @deprecated use `getSession()?.tokens.queryParam` from `~/modules/auth/store/accounts`.
 */
export function getCurrentQueryParamToken() {
  return getSession()?.tokens.queryParam;
}
