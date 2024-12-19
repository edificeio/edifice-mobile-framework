import type { AuthStorageData } from './storage';

import { getStore, IGlobalState, Reducers } from '~/app/store';
import { AudienceValidReactionTypes } from '~/framework/modules/audience/types';
import {
  accountIsActive,
  AccountType,
  ANONYMOUS_ACCOUNT_ID,
  AuthActiveAccount,
  AuthLoggedAccount,
  AuthLoggedAccountMap,
  AuthMixedAccountMap,
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedLoggedInAccount,
  AuthTokenSet,
  getSerializedLoggedInAccountInfo,
  getSerializedLoggedOutAccountInfo,
  LegalUrls,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import { Platform } from '~/framework/util/appConf';
import createReducer from '~/framework/util/redux/reducerFactory';

export interface AuthPendingRestore {
  redirect: undefined;
  account?: keyof IAuthState['accounts']; // If it concerns a saved account, which one
  platform: string; // Platform id of the login task (duplicated the value in `account` if present)
  loginUsed?: string; // Login to display if account is not defined
}

export interface AuthPendingActivation {
  redirect: AuthPendingRedirection.ACTIVATE;
  platform: string;
  loginUsed: string;
  code: string;
}

export interface AuthPendingPasswordRenew {
  redirect: AuthPendingRedirection.RENEW_PASSWORD;
  platform: string;
  loginUsed: string;
  code: string;
  accountId?: keyof IAuthState['accounts']; // If it concerns a saved account, which one
  accountTimestamp?: number;
}

export interface IAuthState {
  accounts: AuthMixedAccountMap; // account list with populated info
  connected?: keyof IAuthState['accounts']; // Currently logged user if so
  requirement?: AuthRequirement; // Requirement for the current account
  lastDeletedAccount?: keyof IAuthState['accounts']; // Last account was deleted
  showOnboarding: AuthStorageData['show-onboarding'];
  platformContexts: Record<string, PlatformAuthContext>; // Platform contexts by pf name
  platformLegalUrls: Record<string, LegalUrls>; // Platform legal urls by pf name
  validReactionTypes: string[]; // Valid reaction types for audience

  pending?: AuthPendingRestore | AuthPendingActivation | AuthPendingPasswordRenew;
  pendingAddAccount?: AuthPendingRestore | AuthPendingActivation | AuthPendingPasswordRenew;

  error?: {
    // No need to affiliate the error to a platform since the `key` contains the render ID on the screen
    key?: number;
    info: Error;
  };

  deviceInfo: {
    uniqueId?: string;
  };

  lastAddAccount: number;
}

// Initial state
export const initialState: IAuthState = {
  accounts: {},
  deviceInfo: {},
  lastAddAccount: 0,
  platformContexts: {},
  platformLegalUrls: {},
  showOnboarding: true,
  validReactionTypes: [],
};

// Actions definitions
export const actionTypes = {
  addAccount: moduleConfig.namespaceActionType('ADD_ACCOUNT'),
  addAccountActivation: moduleConfig.namespaceActionType('ADD_ACCOUNT_ACTIVATION'),
  addAccountInit: moduleConfig.namespaceActionType('ADD_ACCOUNT_INIT'),
  addAccountPasswordRenew: moduleConfig.namespaceActionType('ADD_ACCOUNT_PASSWORD_RENEW'),
  addAccountRedirectCancel: moduleConfig.namespaceActionType('ADD_ACCOUNT_REDIRECT_CANCEL'),
  addAccountRequirement: moduleConfig.namespaceActionType('ADD_ACCOUNT_REQUIREMENT'),
  authError: moduleConfig.namespaceActionType('AUTH_ERROR'),
  authInit: moduleConfig.namespaceActionType('INIT'),
  deactivate: moduleConfig.namespaceActionType('DEACTIVATE'),
  invalidate: moduleConfig.namespaceActionType('INVALIDATE'),
  loadPfContext: moduleConfig.namespaceActionType('LOAD_PF_CONTEXT'),
  loadPfLegalUrls: moduleConfig.namespaceActionType('LOAD_PF_LEGAL_URLS'),
  loadPfValidReactionTypes: moduleConfig.namespaceActionType('LOAD_PF_VALID_REACTION_TYPES'),
  logout: moduleConfig.namespaceActionType('LOGOUT'),
  profileUpdate: moduleConfig.namespaceActionType('PROFILE_UPDATE'),
  redirectActivation: moduleConfig.namespaceActionType('REDIRECT_ACTIVATION'),
  redirectCancel: moduleConfig.namespaceActionType('REDIRECT_CANCEL'),
  redirectPasswordRenew: moduleConfig.namespaceActionType('REDIRECT_PASSWORD_RENEW'),
  refreshToken: moduleConfig.namespaceActionType('REFRESH_TOKEN'),
  removeAccount: moduleConfig.namespaceActionType('REMOVE_ACCOUNT'),
  replaceAccount: moduleConfig.namespaceActionType('REPLACE_ACCOUNT'),
  replaceAccountRequirement: moduleConfig.namespaceActionType('REPLACE_ACCOUNT_REQUIREMENT'),
  setOneSessionId: moduleConfig.namespaceActionType('SET_ONE_SESSION_ID'),
  setQueryParamToken: moduleConfig.namespaceActionType('SET_QUERY_PARAM_TOKEN'),
  updateRequirement: moduleConfig.namespaceActionType('UPDATE_REQUIREMENT'),
};

export const ERASE_ALL_ACCOUNTS = Symbol('ERASE_ALL_ACCOUNTS');

export interface ActionPayloads {
  authInit: Pick<AuthStorageData, 'accounts' | 'startup'> & {
    deviceId: IAuthState['deviceInfo']['uniqueId'];
    showOnboarding: AuthStorageData['show-onboarding'];
  };
  loadPfContext: { name: Platform['name']; context: PlatformAuthContext };
  loadPfLegalUrls: { name: Platform['name']; legalUrls: LegalUrls };
  loadPfValidReactionTypes: { validReactionTypes: AudienceValidReactionTypes };
  addAccount: { account: AuthLoggedAccount };
  addAccountRequirement: { account: AuthLoggedAccount; requirement: AuthRequirement; context: PlatformAuthContext };
  removeAccount: { id: keyof IAuthState['accounts'] };
  replaceAccount: { id: keyof IAuthState['accounts'] | typeof ERASE_ALL_ACCOUNTS; account: AuthLoggedAccount };
  replaceAccountRequirement: {
    id: keyof IAuthState['accounts'] | typeof ERASE_ALL_ACCOUNTS;
    account: AuthLoggedAccount;
    requirement: AuthRequirement;
    context: PlatformAuthContext;
  };
  updateRequirement: { requirement: AuthRequirement; account: AuthLoggedAccount; context?: PlatformAuthContext };
  refreshToken: { id: keyof IAuthState['accounts']; tokens: AuthTokenSet };
  setQueryParamToken: { id: keyof IAuthState['accounts']; token: AuthTokenSet['queryParam'] };
  setOneSessionId: { id: keyof IAuthState['accounts']; token: AuthTokenSet['oneSessionId'] };
  authError: {
    account: keyof IAuthState['accounts'];
    error: NonNullable<Required<IAuthState['error']>>;
  };
  logout: object;
  deactivate: object;
  redirectActivation: { platformName: Platform['name']; login: string; code: string };
  redirectPasswordRenew: {
    platformName: Platform['name'];
    login: string;
    code: string;
    accountId?: keyof IAuthState['accounts'];
    accountTimestamp?: number;
  };
  redirectCancel: {
    platformName: Platform['name'];
    login: string;
    accountId?: keyof IAuthState['accounts'];
    accountTimestamp?: number;
  };
  addAccountInit: object;
  addAccountActivation: { platformName: Platform['name']; login: string; code: string };
  addAccountPasswordRenew: { platformName: Platform['name']; login: string; code: string };
  addAccountRedirectCancel: {
    platformName: Platform['name'];
    login: string;
  };
  profileUpdate: { id: keyof IAuthState['accounts']; user: Partial<AuthLoggedAccount['user']> };
  invalidate: object;
}

export const actions = {
  addAccount: (account: AuthLoggedAccount) => ({
    account,
    type: actionTypes.addAccount,
  }),

  addAccountActivation: (platformName: Platform['name'], login: string, code: string) => ({
    code,
    login,
    platformName,
    type: actionTypes.addAccountActivation,
  }),

  addAccountInit: () => ({
    type: actionTypes.addAccountInit,
  }),

  addAccountPasswordRenew: (
    platformName: Platform['name'],
    login: string,
    code: string,
    accountId?: keyof IAuthState['accounts'],
    accountTimestamp?: number,
  ) => ({
    accountId,
    accountTimestamp,
    code,
    login,
    platformName,
    type: actionTypes.addAccountPasswordRenew,
  }),

  addAccountRedirectCancel: (platformName: Platform['name'], login: string) => ({
    login,
    platformName,
    type: actionTypes.addAccountRedirectCancel,
  }),

  addAccountRequirement: (account: AuthLoggedAccount, requirement: AuthRequirement, context: PlatformAuthContext) => ({
    account,
    context,
    requirement,
    type: actionTypes.addAccountRequirement,
  }),

  authError: (error: NonNullable<IAuthState['error']>, account?: string) => ({
    account,
    error,
    type: actionTypes.authError,
  }),

  authInit: (
    startup: AuthStorageData['startup'],
    accounts: AuthStorageData['accounts'],
    showOnboarding: AuthStorageData['show-onboarding'],
    deviceId: IAuthState['deviceInfo']['uniqueId'],
  ) => ({ accounts, deviceId, showOnboarding, startup, type: actionTypes.authInit }),

  deactivate: () => ({
    type: actionTypes.deactivate,
  }),
  invalidate: () => ({
    type: actionTypes.invalidate,
  }),

  loadPfContext: (name: Platform['name'], context: PlatformAuthContext) => ({ context, name, type: actionTypes.loadPfContext }),

  loadPfLegalUrls: (name: Platform['name'], legalUrls: LegalUrls) => ({ legalUrls, name, type: actionTypes.loadPfLegalUrls }),

  loadPfValidReactionTypes: (validReactionTypes: AudienceValidReactionTypes) => ({
    type: actionTypes.loadPfValidReactionTypes,
    validReactionTypes,
  }),

  logout: () => ({
    type: actionTypes.logout,
  }),

  profileUpdate: (id: string, user: Partial<AuthLoggedAccount['user']>) => ({
    id,
    type: actionTypes.profileUpdate,
    user,
  }),

  redirectActivation: (platformName: Platform['name'], login: string, code: string) => ({
    code,
    login,
    platformName,
    type: actionTypes.redirectActivation,
  }),

  redirectCancel: (
    platformName: Platform['name'],
    login: string,
    accountId?: keyof IAuthState['accounts'],
    accountTimestamp?: number,
  ) => ({
    accountId,
    accountTimestamp,
    login,
    platformName,
    type: actionTypes.redirectCancel,
  }),

  redirectPasswordRenew: (
    platformName: Platform['name'],
    login: string,
    code: string,
    accountId?: keyof IAuthState['accounts'],
    accountTimestamp?: number,
  ) => ({
    accountId,
    accountTimestamp,
    code,
    login,
    platformName,
    type: actionTypes.redirectPasswordRenew,
  }),

  refreshToken: (id: string, tokens: AuthTokenSet) => ({
    id,
    tokens,
    type: actionTypes.refreshToken,
  }),

  removeAccount: (id: keyof IAuthState['accounts']) => ({
    id,
    type: actionTypes.removeAccount,
  }),

  replaceAccount: (id: string | typeof ERASE_ALL_ACCOUNTS, account: AuthLoggedAccount) => ({
    account,
    id,
    type: actionTypes.replaceAccount,
  }),

  replaceAccountRequirement: (
    id: string | typeof ERASE_ALL_ACCOUNTS,
    account: AuthLoggedAccount,
    requirement: AuthRequirement,
    context: PlatformAuthContext,
  ) => ({
    account,
    context,
    id,
    requirement,
    type: actionTypes.replaceAccountRequirement,
  }),

  setOneSessionId: (id: string, token: AuthTokenSet['oneSessionId']) => ({
    id,
    token,
    type: actionTypes.setOneSessionId,
  }),

  setQueryParamToken: (id: string, token: AuthTokenSet['queryParam']) => ({
    id,
    token,
    type: actionTypes.setQueryParamToken,
  }),

  updateRequirement: (requirement: AuthRequirement | undefined, account: AuthLoggedAccount, context?: PlatformAuthContext) => ({
    account,
    context,
    requirement,
    type: actionTypes.updateRequirement,
  }),
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
    if (pending && startup.anonymousToken) {
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

  [actionTypes.authError]: (state, action) => {
    const { error } = action as unknown as ActionPayloads['authError'];
    return {
      ...state,
      error,
      // connected: undefined, // This is a test : a priori, there is no need to erase this field as it will be undefined before any login task
    };
  },

  [actionTypes.logout]: (state, action) => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthLoggedAccount | undefined;
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

  [actionTypes.deactivate]: (state, action) => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthLoggedAccount | undefined;
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

  [actionTypes.addAccountInit]: (state, action) => {
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

  [actionTypes.invalidate]: (state, action) => {
    const currentAccount = (state.connected ? state.accounts[state.connected] : undefined) as AuthLoggedAccount | undefined;
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

Reducers.register(moduleConfig.reducerName, reducer);

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as IAuthState;

/**
 * Get the current active session from Redux state.
 * This is the recommended way to get the session in a component.
 * Though `assertSession` should work, `getSession` does NOT throw exceptions, and return undefined instead,
 * letting you deal with the undefined value as you wish.
 * @returns the active session present in redux state. Can be undefined.
 */
export function getSession() {
  const state = getState(getStore().getState());
  return state.connected ? (state.accounts as AuthLoggedAccountMap)[state.connected] : undefined;
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

export function getAccountById(id?: keyof IAuthState['accounts']) {
  const state = getState(getStore().getState());
  return id ? state.accounts[id] : undefined;
}

export function getDeviceId() { return getState(getStore().getState()).deviceInfo.uniqueId; }

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
