/**
 * Compatibility layer of the former auth thunks.
 * The use cases now are the flows of `~/modules/auth/flows`, called directly (no redux dispatch needed).
 * Everything below only wraps them for the not yet migrated modules, that still dispatch thunks.
 *
 * @deprecated use the flows of `~/modules/auth/flows`.
 */

import type { Platform } from '~/framework/util/appConf';
import { refreshOneSessionId, refreshQueryParamToken } from '~/modules/auth/flows';
import type { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';
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

/**
 * @deprecated use `logout` of `useAuthFlows()` (`~/modules/auth/flows`).
 * TODO(auth-migration): `logout` ends the session through the hooks of the modules, so it needs the flows of the `AuthSessionProvider`
 * (a hook): a thunk can't reach it. Until the screens that dispatch this thunk are migrated (`user/home`, `auth/change-email`,
 * `auth/change-mobile`), their logout button throws.
 */
export const logoutAction = () => async () => {
  // await logout();
  throw new Error('[Auth] logoutAction is not available anymore: use `logout` of `useAuthFlows()`.');
};

/** @deprecated use `refreshOneSessionId` from `~/modules/auth/flows`. */
export const refreshSessionIdForAccountAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async () =>
  refreshOneSessionId(account);

/** @deprecated use `refreshQueryParamToken` from `~/modules/auth/flows`. */
export const refreshQueryParamTokenAction = (account: AuthSavedLoggedInAccount | AuthActiveAccount) => async () =>
  refreshQueryParamToken(account);
