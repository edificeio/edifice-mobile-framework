import type { AudienceValidReactionTypes } from '~/framework/modules/audience/types';
import { Platform } from '~/framework/util/appConf';

import type { AuthActiveAccount, AuthRequirement, AuthTokenSet, LegalUrls, PlatformAuthContext } from '../model';
import moduleConfig from '../module-config';
import type { AuthStorageData } from '../storage';
import type { AuthState } from './types';

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
  setCarbonioToken: moduleConfig.namespaceActionType('SET_CARBONIO_TOKEN'),
  setCarbonioUserInfos: moduleConfig.namespaceActionType('SET_CARBONIO_USER_INFOS'),
  setOneSessionId: moduleConfig.namespaceActionType('SET_ONE_SESSION_ID'),
  setQueryParamToken: moduleConfig.namespaceActionType('SET_QUERY_PARAM_TOKEN'),
  updateRequirement: moduleConfig.namespaceActionType('UPDATE_REQUIREMENT'),
};

// Actions definitions

export const ERASE_ALL_ACCOUNTS = Symbol('ERASE_ALL_ACCOUNTS');

export interface ActionPayloads {
  authInit: Pick<AuthStorageData, 'accounts' | 'startup'> & {
    deviceId: AuthState['deviceInfo']['uniqueId'];
    showOnboarding: AuthStorageData['show-onboarding'];
  };
  loadPfContext: { name: Platform['name']; context: PlatformAuthContext };
  loadPfLegalUrls: { name: Platform['name']; legalUrls: LegalUrls };
  loadPfValidReactionTypes: { validReactionTypes: AudienceValidReactionTypes };
  addAccount: { account: AuthActiveAccount };
  addAccountRequirement: { account: AuthActiveAccount; requirement: AuthRequirement; context: PlatformAuthContext };
  removeAccount: { id: keyof AuthState['accounts'] };
  replaceAccount: { id: keyof AuthState['accounts'] | typeof ERASE_ALL_ACCOUNTS; account: AuthActiveAccount };
  replaceAccountRequirement: {
    id: keyof AuthState['accounts'] | typeof ERASE_ALL_ACCOUNTS;
    account: AuthActiveAccount;
    requirement: AuthRequirement;
    context: PlatformAuthContext;
  };
  updateRequirement: { requirement: AuthRequirement; account: AuthActiveAccount; context?: PlatformAuthContext };
  refreshToken: { id: keyof AuthState['accounts']; tokens: AuthTokenSet };
  setQueryParamToken: { id: keyof AuthState['accounts']; token: AuthTokenSet['queryParam'] };
  setOneSessionId: { id: keyof AuthState['accounts']; token: AuthTokenSet['oneSessionId'] };
  setCarbonioToken: { id: keyof AuthState['accounts']; token: string };
  setCarbonioUserInfos: { id: keyof AuthState['accounts']; carbonioUserInfos: any };
  authError: {
    account: keyof AuthState['accounts'];
    error: NonNullable<Required<AuthState['error']>>;
  };
  logout: object;
  deactivate: object;
  redirectActivation: { platformName: Platform['name']; login: string; code: string };
  redirectPasswordRenew: {
    platformName: Platform['name'];
    login: string;
    code: string;
    accountId?: keyof AuthState['accounts'];
    accountTimestamp?: number;
  };
  redirectCancel: {
    platformName: Platform['name'];
    login: string;
    accountId?: keyof AuthState['accounts'];
    accountTimestamp?: number;
  };
  addAccountInit: object;
  addAccountActivation: { platformName: Platform['name']; login: string; code: string };
  addAccountPasswordRenew: { platformName: Platform['name']; login: string; code: string };
  addAccountRedirectCancel: {
    platformName: Platform['name'];
    login: string;
  };
  profileUpdate: { id: keyof AuthState['accounts']; user: Partial<AuthActiveAccount['user']> };
  invalidate: object;
}

export const actions = {
  addAccount: (account: AuthActiveAccount) => ({
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
    accountId?: keyof AuthState['accounts'],
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

  addAccountRequirement: (account: AuthActiveAccount, requirement: AuthRequirement, context: PlatformAuthContext) => ({
    account,
    context,
    requirement,
    type: actionTypes.addAccountRequirement,
  }),

  authError: (error: NonNullable<AuthState['error']>, account?: string) => ({
    account,
    error,
    type: actionTypes.authError,
  }),

  authInit: (
    startup: AuthStorageData['startup'],
    accounts: AuthStorageData['accounts'],
    showOnboarding: AuthStorageData['show-onboarding'],
    deviceId: AuthState['deviceInfo']['uniqueId'],
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

  profileUpdate: (id: string, user: Partial<AuthActiveAccount['user']>) => ({
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
    accountId?: keyof AuthState['accounts'],
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
    accountId?: keyof AuthState['accounts'],
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

  removeAccount: (id: keyof AuthState['accounts']) => ({
    id,
    type: actionTypes.removeAccount,
  }),

  replaceAccount: (id: string | typeof ERASE_ALL_ACCOUNTS, account: AuthActiveAccount) => ({
    account,
    id,
    type: actionTypes.replaceAccount,
  }),

  replaceAccountRequirement: (
    id: string | typeof ERASE_ALL_ACCOUNTS,
    account: AuthActiveAccount,
    requirement: AuthRequirement,
    context: PlatformAuthContext,
  ) => ({
    account,
    context,
    id,
    requirement,
    type: actionTypes.replaceAccountRequirement,
  }),

  setCarbonioToken: (id: string, token: string) => ({
    id,
    token,
    type: actionTypes.setCarbonioToken,
  }),

  setCarbonioUserInfos: (id: string, carbonioUserInfos: any) => ({
    carbonioUserInfos,
    id,
    type: actionTypes.setCarbonioUserInfos,
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

  updateRequirement: (requirement: AuthRequirement | undefined, account: AuthActiveAccount, context?: PlatformAuthContext) => ({
    account,
    context,
    requirement,
    type: actionTypes.updateRequirement,
  }),
};
