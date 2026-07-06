import { getStore, IGlobalState } from '~/app/store';
import {
  accountIsActive,
  AccountType,
  ANONYMOUS_ACCOUNT_ID,
  AuthActiveAccount,
  AuthLoggedAccountMap,
  AuthPendingRedirection,
  AuthSavedLoggedInAccount,
  getSerializedLoggedInAccountInfo,
  getSerializedLoggedOutAccountInfo,
} from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import appConf, { HostId, Platform } from '~/framework/util/appConf';
import createReducer from '~/framework/util/redux/reducerFactory';

import { ActionPayloads, actionTypes, ERASE_ALL_ACCOUNTS } from './actions';
import { AuthPendingRestore, AuthState } from './types';

export const initialState: AuthState = {
  accounts: {},
  deviceInfo: {},
  lastAddAccount: 0,
  platformContexts: {},
  platformLegalUrls: {},
  showOnboarding: true,
  validReactionTypes: [],
};

const reducer = createReducer(initialState, {
  [actionTypes.authInit]: (state, action) => {
    const { accounts, deviceId, showOnboarding, startup } = action as unknown as ActionPayloads['authInit'];
    let realAccounts = { ...accounts };
    const pending: AuthPendingRestore | undefined = startup.platform
      ? { platform: startup.platform, redirect: undefined }
      : undefined;
    if (pending && startup.account) {
      (pending as AuthPendingRestore).account = startup.account;
    }
    const pendingPlatform = startup.platform ? appConf.getExpandedPlatform(startup.platform) : undefined;
    if (pending && startup.anonymousToken && pendingPlatform) {
      (pending as AuthPendingRestore).account = ANONYMOUS_ACCOUNT_ID;
      realAccounts = {
        ...realAccounts,
        [ANONYMOUS_ACCOUNT_ID]: {
          addTimestamp: 0,
          method: undefined,
          platform: pending.platform,
          tokens: {
            access: {
              expiresAt: startup.anonymousToken.expires_at.toString(),
              type: startup.anonymousToken.token_type as 'Bearer',
              value: startup.anonymousToken.access_token,
            },
            origin: pendingPlatform.url,
            refresh: {
              value: startup.anonymousToken.refresh_token,
            },
            scope: startup.anonymousToken.scope.split(' '),
          },
          user: { displayName: '', id: ANONYMOUS_ACCOUNT_ID, loginUsed: '', type: AccountType.Guest },
        },
      };
    }
    return {
      ...initialState,
      accounts: realAccounts,
      deviceInfo: { ...state.deviceInfo, uniqueId: deviceId },
      pending,
      showOnboarding,
    };
  },

  [actionTypes.loadPfContext]: (state, action) => {
    const { context, name } = action as unknown as ActionPayloads['loadPfContext'];
    return { ...state, platformContexts: { ...state.platformContexts, [name]: context } };
  },

  [actionTypes.loadPfLegalUrls]: (state, action) => {
    const { legalUrls, name } = action as unknown as ActionPayloads['loadPfLegalUrls'];
    return { ...state, platformLegalUrls: { ...state.platformLegalUrls, [name]: legalUrls } };
  },

  [actionTypes.loadPfValidReactionTypes]: (state, action) => {
    const { validReactionTypes } = action as unknown as ActionPayloads['loadPfValidReactionTypes'];
    return { ...state, validReactionTypes: validReactionTypes['reaction-types'] };
  },

  [actionTypes.addAccount]: (state, action) => {
    const { account } = action as unknown as ActionPayloads['addAccount'];
    return {
      ...state,
      accounts: { ...state.accounts, [account.user.id]: account },
      connected: account.user.id,
      lastAddAccount: Date.now(),
      lastDeletedAccount: undefined,
      requirement: undefined,
      showOnboarding: false,
    };
  },

  [actionTypes.addAccountRequirement]: (state, action) => {
    const { account, context, requirement } = action as unknown as ActionPayloads['addAccountRequirement'];
    return {
      ...state,
      accounts: { ...state.accounts, [account.user.id]: account },
      connected: account.user.id,
      lastAddAccount: Date.now(),
      lastDeletedAccount: undefined,
      platformContexts: { ...state.platformContexts, [account.platform.name]: context },
      requirement,
      showOnboarding: false,
    };
  },

  [actionTypes.removeAccount]: (state, action) => {
    const { id } = action as unknown as ActionPayloads['removeAccount'];
    const newAccounts = { ...state.accounts };
    delete newAccounts[id];
    return {
      ...state,
      accounts: newAccounts,
      lastDeletedAccount: id,
      requirement: undefined,
    };
  },

  [actionTypes.replaceAccount]: (state, action) => {
    const { account, id } = action as unknown as ActionPayloads['replaceAccount'];
    const newAccounts = id === ERASE_ALL_ACCOUNTS ? {} : { ...state.accounts };
    if (id !== ERASE_ALL_ACCOUNTS) delete newAccounts[id];
    return {
      ...state,
      accounts: { ...newAccounts, [account.user.id]: account },
      connected: account.user.id,
      lastDeletedAccount: undefined,
      requirement: undefined,
      showOnboarding: false,
    };
  },

  [actionTypes.replaceAccountRequirement]: (state, action) => {
    const { account, context, id, requirement } = action as unknown as ActionPayloads['replaceAccountRequirement'];
    const newAccounts = id === ERASE_ALL_ACCOUNTS ? {} : { ...state.accounts };
    if (id !== ERASE_ALL_ACCOUNTS) delete newAccounts[id];
    return {
      ...state,
      accounts: { ...newAccounts, [account.user.id]: account },
      connected: account.user.id,
      lastDeletedAccount: undefined,
      platformContexts: { ...state.platformContexts, [account.platform.name]: context },
      requirement,
      showOnboarding: false,
    };
  },

  [actionTypes.updateRequirement]: (state, action) => {
    if (!state.connected) return state;
    const { account, context, requirement } = action as unknown as ActionPayloads['updateRequirement'];
    const id = account.user.id;
    if (context)
      return {
        ...state,
        accounts: { ...state.accounts, [id]: account },
        platformContexts: { ...state.platformContexts, [account.platform.name]: context },
        requirement,
      };
    else return { ...state, accounts: { ...state.accounts, [id]: account }, requirement };
  },

  [actionTypes.refreshToken]: (state, action) => {
    const { id, tokens } = action as unknown as ActionPayloads['refreshToken'];
    return { ...state, accounts: { ...state.accounts, [id]: { ...state.accounts[id], tokens } } };
  },

  [actionTypes.setQueryParamToken]: (state, action) => {
    const { id, token } = action as unknown as ActionPayloads['setQueryParamToken'];
    const tokens = (state.accounts[id] as Partial<AuthActiveAccount | AuthSavedLoggedInAccount>).tokens
      ? { ...(state.accounts[id] as AuthActiveAccount | AuthSavedLoggedInAccount).tokens, queryParam: token }
      : undefined;
    return tokens
      ? {
          ...state,
          accounts: {
            ...state.accounts,
            [id]: { ...state.accounts[id], tokens },
          },
        }
      : state;
  },

  [actionTypes.setOneSessionId]: (state, action) => {
    const { id, token } = action as unknown as ActionPayloads['setOneSessionId'];
    const tokens = (state.accounts[id] as Partial<AuthActiveAccount | AuthSavedLoggedInAccount>).tokens
      ? { ...(state.accounts[id] as AuthActiveAccount | AuthSavedLoggedInAccount).tokens, oneSessionId: token }
      : undefined;
    return tokens
      ? {
          ...state,
          accounts: {
            ...state.accounts,
            [id]: { ...state.accounts[id], tokens },
          },
        }
      : state;
  },

  [actionTypes.setCarbonioToken]: (state, action) => {
    const { id, token } = action as unknown as ActionPayloads['setCarbonioToken'];
    const tokens = (state.accounts[id] as Partial<AuthActiveAccount | AuthSavedLoggedInAccount>).tokens
      ? { ...(state.accounts[id] as AuthActiveAccount | AuthSavedLoggedInAccount).tokens, carbonioToken: token }
      : undefined;
    return tokens ? { ...state, accounts: { ...state.accounts, [id]: { ...state.accounts[id], tokens } } } : state;
  },
  [actionTypes.setCarbonioUserInfos]: (state, action) => {
    const { carbonioUserInfos, id } = action as unknown as ActionPayloads['setCarbonioUserInfos'];
    return { ...state, accounts: { ...state.accounts, [id]: { ...state.accounts[id], carbonioUserInfos } } };
  },
  [actionTypes.authError]: (state, action) => {
    const { error } = action as unknown as ActionPayloads['authError'];
    return {
      ...state,
      error,
      // connected: undefined, // This is a test : a priori, there is no need to erase this field as it will be undefined before any login task
    };
  },

  [actionTypes.logout]: state => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthActiveAccount | undefined;
    if (!currentAccount) return state;
    return {
      ...state,
      accounts: { ...state.accounts, [currentAccount.user.id]: getSerializedLoggedOutAccountInfo(currentAccount) },
      connected: undefined,
      error: undefined,
      lastDeletedAccount: undefined,
      pending: undefined,
      requirement: undefined,
    };
  },

  [actionTypes.deactivate]: state => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthActiveAccount | undefined;
    if (!currentAccount) return state;
    return {
      ...state,
      accounts: { ...state.accounts, [currentAccount.user.id]: getSerializedLoggedInAccountInfo(currentAccount) },
      connected: undefined,
      error: undefined,
      lastDeletedAccount: undefined,
      pending: undefined,
      requirement: undefined,
    };
  },

  [actionTypes.redirectActivation]: (state, action) => {
    const { code, login, platformName } = action as unknown as ActionPayloads['redirectActivation'];
    return {
      ...state,
      connected: undefined,
      error: undefined,
      pending: {
        code,
        loginUsed: login,
        platform: platformName,
        redirect: AuthPendingRedirection.ACTIVATE as const,
      },
      requirement: undefined,
    };
  },

  [actionTypes.redirectPasswordRenew]: (state, action) => {
    const { accountId, accountTimestamp, code, login, platformName } = action as unknown as ActionPayloads['redirectPasswordRenew'];
    return {
      ...state,
      connected: undefined,
      error: undefined,
      pending: {
        accountId,
        accountTimestamp,
        code,
        loginUsed: login,
        platform: platformName,
        redirect: AuthPendingRedirection.RENEW_PASSWORD as const,
      },
      requirement: undefined,
    };
  },

  [actionTypes.redirectCancel]: (state, action) => {
    const { accountId, accountTimestamp, login, platformName } = action as unknown as ActionPayloads['redirectCancel'];
    return {
      ...state,
      connected: undefined,
      pending: {
        accountId,
        accountTimestamp,
        loginUsed: login,
        platform: platformName,
        redirect: undefined,
      },
      requirement: undefined,
    };
  },

  [actionTypes.profileUpdate]: (state, action) => {
    const { id, user } = action as unknown as ActionPayloads['profileUpdate'];
    const account = state.accounts[id] as AuthActiveAccount;
    if (!account || !accountIsActive(account)) return state;
    const newAccount = { ...account, user: { ...account.user, ...user } } as AuthActiveAccount;
    return { ...state, accounts: { ...state.accounts, [id]: newAccount } };
  },

  [actionTypes.addAccountInit]: state => {
    return { ...state, error: undefined, pendingAddAccount: undefined };
  },

  [actionTypes.addAccountActivation]: (state, action) => {
    const { code, login, platformName } = action as unknown as ActionPayloads['redirectActivation'];
    return {
      ...state,
      error: undefined,
      pendingAddAccount: {
        code,
        loginUsed: login,
        platform: platformName,
        redirect: AuthPendingRedirection.ACTIVATE as const,
      },
      requirement: undefined,
    };
  },

  [actionTypes.addAccountPasswordRenew]: (state, action) => {
    const { accountId, accountTimestamp, code, login, platformName } = action as unknown as ActionPayloads['redirectPasswordRenew'];
    return {
      ...state,
      error: undefined,
      pendingAddAccount: {
        accountId,
        accountTimestamp,
        code,
        loginUsed: login,
        platform: platformName,
        redirect: AuthPendingRedirection.RENEW_PASSWORD as const,
      },
      requirement: undefined,
    };
  },

  [actionTypes.addAccountRedirectCancel]: (state, action) => {
    const { login, platformName } = action as unknown as ActionPayloads['addAccountRedirectCancel'];
    return {
      ...state,
      pendingAddAccount: {
        loginUsed: login,
        platform: platformName,
        redirect: undefined,
      },
      requirement: undefined,
    };
  },

  [actionTypes.invalidate]: state => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthActiveAccount | undefined;
    if (!currentAccount) return state;
    return {
      ...state,
      accounts: { ...state.accounts, [currentAccount.user.id]: getSerializedLoggedOutAccountInfo(currentAccount) },
      connected: undefined,
      lastDeletedAccount: undefined,
      pending: { account: currentAccount.user.id, platform: currentAccount.platform.name, redirect: undefined },
      requirement: undefined,
    };
  },
});

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as AuthState;

export const selectors = {
  accounts: (state: IGlobalState) => getState(state).accounts,
  connected: (state: IGlobalState) => getState(state).connected,
  hostContext: (name: HostId) => (state: IGlobalState) => getState(state).platformContexts[name],
  lastAddAccount: (state: IGlobalState) => getState(state).lastAddAccount,
  lastDeletedAccount: (state: IGlobalState) => getState(state).lastDeletedAccount,
  pending: (state: IGlobalState) => getState(state).pending,
  requirement: (state: IGlobalState) => {
    const authState = getState(state);
    return authState.requirement;
  },
  session: (state: IGlobalState) => {
    const authState = getState(state);
    return authState.connected ? (authState.accounts as AuthLoggedAccountMap)[authState.connected] : undefined;
  },
  showOnboarding: (state: IGlobalState) => getState(state).showOnboarding,
};

/**
 * Get the current active session from Redux state.
 * This is the recommended way to get the session in a component.
 * Though `assertSession` should work, `getSession` does NOT throw exceptions, and return undefined instead,
 * letting you deal with the undefined value as you wish.
 * @returns the active session present in redux state. Can be undefined.
 * @deprecated use the hook useSelector() or withSession() HOC.
 */
export function getSession() {
  return selectors.session(getStore().getState());
}

export function getPlatform() {
  return getSession()?.platform;
}

/**
 * get the platform context of the authentified user.
 */
export function getPlatformContext() {
  const state = getState(getStore().getState());
  const session = getSession();
  return session ? state.platformContexts[session.platform.name] : undefined;
}

/**
 * get the platform context of the given platform
 */
export function getPlatformContextOf(platform?: Platform) {
  const state = getState(getStore().getState());
  return platform ? state.platformContexts[platform.name] : undefined;
}

export function getPlatformLegalUrls() {
  const state = getState(getStore().getState());
  const session = getSession();
  return session ? state.platformLegalUrls[session.platform.name] : undefined;
}

export function getPlatformLegalUrlsOf(platform?: Platform) {
  const state = getState(getStore().getState());
  return platform ? state.platformLegalUrls[platform.name] : undefined;
}

export function getValidReactionTypes() {
  const state = getState(getStore().getState());
  return state.validReactionTypes;
}

export function getAccountsNumber() {
  const state = getState(getStore().getState());
  return Object.keys(state.accounts).length;
}

export function getAccounts() {
  const state = getState(getStore().getState());
  return Object.values(state.accounts);
}

export function getAccountById(id?: keyof AuthState['accounts']) {
  const state = getState(getStore().getState());
  return id ? state.accounts[id] : undefined;
}

export function getDeviceId() {
  return getState(getStore().getState()).deviceInfo.uniqueId;
}

/**
 * Gets the currently stored query param token. Do NOT refresh it if expired.
 * Please use `getQueryParamToken` in `oauth.ts` instead.
 * @returns
 */
export function getCurrentQueryParamToken() {
  return getSession()?.tokens.queryParam;
}

/**
 * Get the current active session.
 * This IS NOT the recommended way to get the session information.
 * - In a component, use the below `getSession`
 * - In an action/thunk, use this only if you call your action with tryAction/callAction. Else, use the below `getSession`
 * - In a utility function, use this assertion.
 * Caution : this is an "assert" function. If session not present, this function will throw an error.
 * @returns the current session
 * @throws Error
 */
export function assertSession() {
  const session = getSession();
  if (!session) throw new Error('[assertSession] no session');
  return session;
}

export default reducer;
