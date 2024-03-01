import { IGlobalState, Reducers, getStore } from '~/app/store';
import {
  ANONYMOUS_ACCOUNT_ID,
  AccountType,
  AuthLoggedAccount,
  AuthLoggedAccountMap,
  AuthMixedAccountMap,
  AuthPendingRedirection,
  AuthRequirement,
  AuthTokenSet,
  LegalUrls,
  PlatformAuthContext,
  accountIsLogged,
} from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import { Platform } from '~/framework/util/appConf';
import createReducer from '~/framework/util/redux/reducerFactory';

import { AuthStorageData, getSerializedLoggedOutAccountInfo } from './storage';

export interface AuthPendingRestore {
  redirect: undefined;
  account?: keyof IAuthState['accounts']; // If it concerns a saved account, which one
  platform: string; // Platform id of the login task (duplicated the value in `account` if present)
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
}

export interface IAuthState {
  accounts: AuthMixedAccountMap; // account list with populated info
  connected?: keyof IAuthState['accounts']; // Currently logged user if so
  requirement?: AuthRequirement; // Requirement for the current account
  deleted?: keyof IAuthState['accounts']; // Last account was deleted
  showOnboarding: AuthStorageData['show-onboarding'];
  platformContexts: Record<string, PlatformAuthContext>; // Platform contexts by pf name
  platformLegalUrls: Record<string, LegalUrls>; // Platform legal urls by pf name

  pending?: AuthPendingRestore | AuthPendingActivation | AuthPendingPasswordRenew;
  pendingAddAccount?: AuthPendingActivation | AuthPendingPasswordRenew;

  error?: {
    // No need to affiliate the error to a platform since the `key` contains the render ID on the screen
    key?: number;
    info: Error;
  };

  deviceInfo: {
    uniqueId?: string;
  };
}

// Initial state
export const initialState: IAuthState = {
  accounts: {},
  showOnboarding: true,
  platformContexts: {},
  platformLegalUrls: {},
  deviceInfo: {},
};

// Actions definitions
export const actionTypes = {
  authInit: moduleConfig.namespaceActionType('INIT'),
  loadPfContext: moduleConfig.namespaceActionType('LOAD_PF_CONTEXT'),
  loadPfLegalUrls: moduleConfig.namespaceActionType('LOAD_PF_LEGAL_URLS'),
  login: moduleConfig.namespaceActionType('LOGIN'),
  loginRequirement: moduleConfig.namespaceActionType('LOGIN_REQUIREMENT'),
  updateRequirement: moduleConfig.namespaceActionType('UPDATE_REQUIREMENT'),
  refreshToken: moduleConfig.namespaceActionType('REFRESH_TOKEN'),
  setQueryParamToken: moduleConfig.namespaceActionType('SET_QUERY_PARAM_TOKEN'),
  authError: moduleConfig.namespaceActionType('AUTH_ERROR'),
  logout: moduleConfig.namespaceActionType('LOGOUT'),
  redirectActivation: moduleConfig.namespaceActionType('REDIRECT_ACTIVATION'),
  redirectPasswordRenew: moduleConfig.namespaceActionType('REDIRECT_PASSWORD_RENEW'),
  profileUpdate: moduleConfig.namespaceActionType('PROFILE_UPDATE'),
  addAccount: moduleConfig.namespaceActionType('ADD_ACCOUNT'),
  addAccountRequirement: moduleConfig.namespaceActionType('ADD_ACCOUNT_REQUIREMENT'),
  addAccountActivation: moduleConfig.namespaceActionType('ADD_ACCOUNT_ACTIVATION'),
  addAccountPasswordRenew: moduleConfig.namespaceActionType('ADD_ACCOUNT_PASSWORD_RENEW'),
};

export interface ActionPayloads {
  authInit: Pick<AuthStorageData, 'accounts' | 'startup'> & {
    deviceId: IAuthState['deviceInfo']['uniqueId'];
    showOnboarding: AuthStorageData['show-onboarding'];
  };
  loadPfContext: { name: Platform['name']; context: PlatformAuthContext };
  loadPfLegalUrls: { name: Platform['name']; legalUrls: LegalUrls };
  login: { id: string; account: AuthLoggedAccount };
  loginRequirement: { id: string; account: AuthLoggedAccount; requirement: AuthRequirement; context: PlatformAuthContext };
  updateRequirement: { requirement: AuthRequirement; account: AuthLoggedAccount; context?: PlatformAuthContext };
  refreshToken: { id: string; tokens: AuthTokenSet };
  setQueryParamToken: { id: string; token: AuthTokenSet['queryParam'] };
  authError: {
    account: keyof IAuthState['accounts'];
    error: NonNullable<Required<IAuthState['error']>>;
  };
  logout: object;
  redirectActivation: { platformName: Platform['name']; login: string; code: string };
  redirectPasswordRenew: { platformName: Platform['name']; login: string; code: string };
  profileUpdate: { id: string; user: Partial<AuthLoggedAccount['user']> };
  addAccount: { id: string; account: AuthLoggedAccount };
  addAccountRequirement: { id: string; account: AuthLoggedAccount; requirement: AuthRequirement; context: PlatformAuthContext };
  addAccountActivation: { platformName: Platform['name']; login: string; code: string };
  addAccountPasswordRenew: { platformName: Platform['name']; login: string; code: string };
}

export const actions = {
  authInit: (
    startup: AuthStorageData['startup'],
    accounts: AuthStorageData['accounts'],
    showOnboarding: AuthStorageData['show-onboarding'],
    deviceId: IAuthState['deviceInfo']['uniqueId'],
  ) => ({ type: actionTypes.authInit, startup, accounts, showOnboarding, deviceId }),

  loadPfContext: (name: Platform['name'], context: PlatformAuthContext) => ({ type: actionTypes.loadPfContext, name, context }),

  loadPfLegalUrls: (name: Platform['name'], legalUrls: LegalUrls) => ({ type: actionTypes.loadPfLegalUrls, name, legalUrls }),

  login: (id: string, account: AuthLoggedAccount) => ({
    type: actionTypes.login,
    id,
    account,
  }),

  loginRequirement: (id: string, account: AuthLoggedAccount, requirement: AuthRequirement, context: PlatformAuthContext) => ({
    type: actionTypes.loginRequirement,
    id,
    account,
    requirement,
    context,
  }),

  updateRequirement: (requirement: AuthRequirement | undefined, account: AuthLoggedAccount, context?: PlatformAuthContext) => ({
    type: actionTypes.updateRequirement,
    requirement,
    account,
    context,
  }),

  refreshToken: (id: string, tokens: AuthTokenSet) => ({
    type: actionTypes.refreshToken,
    id,
    tokens,
  }),

  setQueryParamToken: (id: string, token: AuthTokenSet['queryParam']) => ({
    type: actionTypes.setQueryParamToken,
    id,
    token,
  }),

  authError: (error: NonNullable<IAuthState['error']>, account?: string) => ({
    type: actionTypes.authError,
    account,
    error,
  }),

  logout: () => ({
    type: actionTypes.logout,
  }),

  redirectActivation: (platformName: Platform['name'], login: string, code: string) => ({
    type: actionTypes.redirectActivation,
    platformName,
    login,
    code,
  }),

  redirectPasswordRenew: (platformName: Platform['name'], login: string, code: string) => ({
    type: actionTypes.redirectPasswordRenew,
    platformName,
    login,
    code,
  }),

  profileUpdate: (id: string, user: Partial<AuthLoggedAccount['user']>) => ({
    type: actionTypes.profileUpdate,
    id,
    user,
  }),

  addAccount: (id: string, account: AuthLoggedAccount) => ({
    type: actionTypes.addAccount,
    id,
    account,
  }),

  addAccountRequirement: (id: string, account: AuthLoggedAccount, requirement: AuthRequirement, context: PlatformAuthContext) => ({
    type: actionTypes.addAccountRequirement,
    id,
    account,
    requirement,
    context,
  }),

  addAccountActivation: (platformName: Platform['name'], login: string, code: string) => ({
    type: actionTypes.addAccountActivation,
    platformName,
    login,
    code,
  }),

  addAccountPasswordRenew: (platformName: Platform['name'], login: string, code: string) => ({
    type: actionTypes.addAccountPasswordRenew,
    platformName,
    login,
    code,
  }),
};

const reducer = createReducer(initialState, {
  [actionTypes.authInit]: (state, action) => {
    const { accounts, startup, showOnboarding, deviceId } = action as unknown as ActionPayloads['authInit'];
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
          platform: pending.platform,
          user: { displayName: '', id: '', loginUsed: '', type: AccountType.Guest },
          tokens: {
            access: {
              type: startup.anonymousToken.token_type as 'Bearer',
              value: startup.anonymousToken.access_token,
              expiresAt: startup.anonymousToken.expires_at.toString(),
            },
            refresh: {
              value: startup.anonymousToken.refresh_token,
            },
            scope: startup.anonymousToken.scope.split(' '),
          },
        },
      };
    }
    return {
      ...initialState,
      accounts: realAccounts,
      showOnboarding,
      pending,
      deviceInfo: { ...state.deviceInfo, uniqueId: deviceId },
    };
  },

  [actionTypes.loadPfContext]: (state, action) => {
    const { name, context } = action as unknown as ActionPayloads['loadPfContext'];
    return { ...state, platformContexts: { ...state.platformContexts, [name]: context } };
  },

  [actionTypes.loadPfLegalUrls]: (state, action) => {
    const { name, legalUrls } = action as unknown as ActionPayloads['loadPfLegalUrls'];
    return { ...state, platformLegalUrls: { ...state.platformLegalUrls, [name]: legalUrls } };
  },

  [actionTypes.login]: (state, action) => {
    const { id, account } = action as unknown as ActionPayloads['login'];
    return {
      ...state,
      accounts: { ...state.accounts, [id]: account },
      connected: id,
      showOnboarding: false,
      requirement: undefined,
    };
  },

  [actionTypes.loginRequirement]: (state, action) => {
    const { id, account, requirement, context } = action as unknown as ActionPayloads['loginRequirement'];
    return {
      ...state,
      accounts: { ...state.accounts, [id]: account },
      connected: id,
      showOnboarding: false,
      requirement,
      platformContexts: { ...state.platformContexts, [account.platform.name]: context },
    };
  },

  [actionTypes.updateRequirement]: (state, action) => {
    if (!state.connected) return state;
    const { requirement, context, account } = action as unknown as ActionPayloads['updateRequirement'];
    const id = account.user.id;
    if (context)
      return {
        ...state,
        accounts: { ...state.accounts, [id]: account },
        requirement,
        platformContexts: { ...state.platformContexts, [account.platform.name]: context },
      };
    else return { ...state, accounts: { ...state.accounts, [id]: account }, requirement };
  },

  [actionTypes.refreshToken]: (state, action) => {
    const { id, tokens } = action as unknown as ActionPayloads['refreshToken'];
    return { ...state, accounts: { ...state.accounts, [id]: { ...state.accounts[id], tokens } } };
  },

  [actionTypes.setQueryParamToken]: (state, action) => {
    const { id, token } = action as unknown as ActionPayloads['setQueryParamToken'];
    return {
      ...state,
      accounts: {
        ...state.accounts,
        [id]: { ...state.accounts[id], tokens: { ...state.accounts[id].tokens!, queryParam: token } },
      },
    };
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
      requirement: undefined,
      connected: undefined,
      pending: undefined,
      error: undefined,
    };
  },

  [actionTypes.redirectActivation]: (state, action) => {
    const { platformName, login, code } = action as unknown as ActionPayloads['redirectActivation'];
    return {
      ...state,
      requirement: undefined,
      connected: undefined,
      error: undefined,
      pending: {
        redirect: AuthPendingRedirection.ACTIVATE as const,
        platform: platformName,
        loginUsed: login,
        code,
      },
    };
  },

  [actionTypes.redirectPasswordRenew]: (state, action) => {
    const { platformName, login, code } = action as unknown as ActionPayloads['redirectPasswordRenew'];
    return {
      ...state,
      requirement: undefined,
      connected: undefined,
      error: undefined,
      pending: {
        redirect: AuthPendingRedirection.RENEW_PASSWORD as const,
        platform: platformName,
        loginUsed: login,
        code,
      },
    };
  },

  [actionTypes.profileUpdate]: (state, action) => {
    const { id, user } = action as unknown as ActionPayloads['profileUpdate'];
    const account = state.accounts[id] as AuthLoggedAccount;
    if (!account || !accountIsLogged(account)) return state;
    return { ...state, accounts: { ...state.accounts, [id]: { ...account, user: { ...account.user, ...user } } } };
  },

  [actionTypes.addAccount]: (state, action) => {
    const { id, account } = action as unknown as ActionPayloads['login'];
    return {
      ...state,
      accounts: { ...state.accounts, [id]: account },
      connected: id,
      showOnboarding: false,
      requirement: undefined,
    };
  },

  [actionTypes.addAccountRequirement]: (state, action) => {
    const { id, account, requirement, context } = action as unknown as ActionPayloads['loginRequirement'];
    return {
      ...state,
      accounts: { ...state.accounts, [id]: account },
      connected: id,
      showOnboarding: false,
      requirement,
      platformContexts: { ...state.platformContexts, [account.platform.name]: context },
    };
  },

  [actionTypes.addAccountActivation]: (state, action) => {
    const { platformName, login, code } = action as unknown as ActionPayloads['redirectActivation'];
    return {
      ...state,
      requirement: undefined,
      error: undefined,
      pendingAddAccount: {
        redirect: AuthPendingRedirection.ACTIVATE as const,
        platform: platformName,
        loginUsed: login,
        code,
      },
    };
  },

  [actionTypes.addAccountPasswordRenew]: (state, action) => {
    const { platformName, login, code } = action as unknown as ActionPayloads['redirectPasswordRenew'];
    return {
      ...state,
      requirement: undefined,
      error: undefined,
      pendingAddAccount: {
        redirect: AuthPendingRedirection.RENEW_PASSWORD as const,
        platform: platformName,
        loginUsed: login,
        code,
      },
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

export function getAccountsNumber() {
  const state = getState(getStore().getState());
  return Object.keys(state.accounts).length;
}

export function getAccounts() {
  const state = getState(getStore().getState());
  return Object.values(state.accounts);
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
