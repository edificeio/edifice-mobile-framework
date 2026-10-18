/**
 * Compatibility layer of the former auth thunks.
 * The use cases now are the flows of `~/modules/auth/flows`, called directly (no redux dispatch needed).
 * Everything below only wraps them for the not yet migrated modules, that still dispatch thunks.
 *
 * @deprecated use the flows of `~/modules/auth/flows`.
 */

import type { Platform } from '~/framework/util/appConf';
import { changePassword, logout, refreshOneSessionId, refreshQueryParamToken, refreshRequirements } from '~/modules/auth/flows';
import type { AuthActiveAccount, AuthSavedLoggedInAccount, IChangePasswordPayload } from '~/modules/auth/model';
import service from '~/modules/auth/service';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';

export interface IChangePasswordModel {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

/**
 * Fetches the auth context of the given platform and stores it.
 * @deprecated use `service.platformConfig.context(platform)` then `usePlatformContextStore.getState().setContext(...)`.
 */
export const loadAuthContextAction = (platform: Platform) => async () => {
  const context = await service.platformConfig.context(platform);
  if (!context) return;
  usePlatformContextStore.getState().setContext(platform.name, context);
  return context;
};

/**
 * Fetches the legal urls of the given platform and stores them.
 * @deprecated use `service.platformConfig.authI18n(platform)` then `usePlatformLegalUrlsStore.getState().setLegalUrls(...)`.
 */
export const loadPlatformLegalUrlsAction = (platform: Platform) => async () => {
  const legalUrls = await service.platformConfig.authI18n(platform);
  if (!legalUrls) return;
  usePlatformLegalUrlsStore.getState().setLegalUrls(platform.name, legalUrls);
  return legalUrls;
};

/** @deprecated use `refreshRequirements` from `~/modules/auth/flows`. */
export const refreshRequirementsAction = () => async () => {
  await refreshRequirements();
};

/** @deprecated use `logout` from `~/modules/auth/flows`. */
export const logoutAction = () => async () => {
  await logout();
};

/** @deprecated use `refreshOneSessionId` from `~/modules/auth/flows`. */
export const refreshSessionIdForAccountAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async () =>
  refreshOneSessionId(account);

/** @deprecated use `refreshQueryParamToken` from `~/modules/auth/flows`. */
export const refreshQueryParamTokenAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async () =>
  refreshQueryParamToken(account);

/* eslint-disable @typescript-eslint/no-unused-vars -- the parameters are kept for the callers */
/**
 * Changes the password of the connected user, then signs in again with it.
 * Only the connected account is concerned: the account id and the platform given are those of the connected account.
 * @deprecated use `changePassword` from `~/modules/auth/flows`.
 */
export const buildChangePasswordActionReplaceAccount =
  (_accountId: string, _timestamp: number) =>
  (_platform: Platform, p: IChangePasswordPayload, _forceChange?: boolean, _rememberMe?: boolean) =>
  async () => {
    await changePassword({ confirm: p.confirm, newPassword: p.newPassword, oldPassword: 'oldPassword' in p ? p.oldPassword : '' });
  };
