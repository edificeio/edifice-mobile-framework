/**
 * Compatibility layer of the former auth redux actions.
 * The auth state lives in the zustand stores of `~/modules/auth/store`, and nothing reduces these actions anymore, except
 * the `sessionReducers` of the not yet migrated modules that listen to the account changes (see `actionTypes`).
 * These ones are still dispatched by the flows (see `~/modules/auth/flows/legacy-redux`).
 *
 * @deprecated use the stores of `~/modules/auth/store` and the flows of `~/modules/auth/flows`.
 */

import { useAccountsStore } from '~/modules/auth/store/accounts';

import type { AuthActiveAccount } from '../model';
import moduleConfig from '../module-config';

export const actionTypes = {
  addAccount: moduleConfig.namespaceActionType('ADD_ACCOUNT'),
  profileUpdate: moduleConfig.namespaceActionType('PROFILE_UPDATE'),
  replaceAccount: moduleConfig.namespaceActionType('REPLACE_ACCOUNT'),
  setCarbonioToken: moduleConfig.namespaceActionType('SET_CARBONIO_TOKEN'),
  setCarbonioUserInfos: moduleConfig.namespaceActionType('SET_CARBONIO_USER_INFOS'),
  updateRequirement: moduleConfig.namespaceActionType('UPDATE_REQUIREMENT'),
};

export interface ActionPayloads {
  addAccount: { account: AuthActiveAccount };
  replaceAccount: { id: string; account: AuthActiveAccount };
  updateRequirement: { account: AuthActiveAccount };
}

export const actions = {
  /**
   * Action dispatched when an account is added (no account was replaced), for the `sessionReducers` of other modules.
   * @deprecated listen to the accounts store instead.
   */
  addAccount: (account: AuthActiveAccount) => ({
    account,
    type: actionTypes.addAccount,
  }),

  /**
   * Updates the user profile of the account in the zustand store, then returns an action with no effect on redux.
   * @deprecated use `useAccountsStore.getState().updateProfile(id, user)` from `~/modules/auth/store/accounts`.
   */
  profileUpdate: (id: string, user: Partial<AuthActiveAccount['user']>) => {
    useAccountsStore.getState().updateProfile(id, user);
    return { id, type: actionTypes.profileUpdate, user };
  },

  /**
   * Action dispatched when an account replaces another one, for the `sessionReducers` of other modules.
   * @deprecated listen to the accounts store instead.
   */
  replaceAccount: (id: string, account: AuthActiveAccount) => ({
    account,
    id,
    type: actionTypes.replaceAccount,
  }),

  /**
   * Sets the carbonio token in the zustand store, then returns an action with no effect on redux.
   * @deprecated use `useAccountsStore.getState().setCarbonioToken(id, token)` from `~/modules/auth/store/accounts`.
   */
  setCarbonioToken: (id: string, token: string) => {
    useAccountsStore.getState().setCarbonioToken(id, token);
    return { id, token, type: actionTypes.setCarbonioToken };
  },

  /**
   * Sets the carbonio user infos in the zustand store, then returns an action with no effect on redux.
   * @deprecated use `useAccountsStore.getState().setCarbonioUserInfos(id, infos)` from `~/modules/auth/store/accounts`.
   */
  setCarbonioUserInfos: (id: string, carbonioUserInfos: any) => {
    useAccountsStore.getState().setCarbonioUserInfos(id, carbonioUserInfos);
    return { carbonioUserInfos, id, type: actionTypes.setCarbonioUserInfos };
  },
};
