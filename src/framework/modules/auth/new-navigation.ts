/**
 * Auth Navigation
 *
 * Exposes logic about navigation between the auth screen & relation between redux state and navigation screens
 */

import type { NavigationState, PartialState } from '@react-navigation/native';

import { NavigationRootParams } from '~/app/navigation/types';
import appConf, { type Platform } from '~/framework/util/appConf';

import {
  accountIsActive,
  AuthActiveAccount,
  AuthActiveAccountWithCredentials,
  AuthActiveAccountWithSaml,
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedAccount,
} from './model';
import { AuthState } from './redux/types';

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getRouteForOnboarding = () => {
  return appConf.hasMultiplePlatform ? ({ name: 'auth/platforms' } as const) : ({ name: 'auth/login' } as const);
};

/**
 * Return the navigation action to be performed when selecting a platform.
 * No account information can be provided, as selecting a platform allow any user to log in.
 * @param platform
 * @returns
 */
export const getRouteForPlatformSelect = (platform: Platform) => {
  return getRouteForLoginRedirection(platform);
};

/**
 * Return the navigation actions to be performed for returning to the login screen of the given platform.
 * The result is an array in case multiple actions must be performed
 * @param platform
 * @param account Saved account information to skip identification input for the user.
 * @param loginUsed When account is not provided, given loginUsed will be passed to the screen as a param.
 * @returns
 */
export const getRouteForLoginRedirection = (
  platform: Platform,
  account?: Pick<AuthSavedAccount | AuthActiveAccount, 'method'> & {
    user: Pick<(AuthSavedAccount | AuthActiveAccount)['user'], 'id'>;
  },
  loginUsed?: string,
) => {
  if (platform.redirect) return { name: 'auth/login/redirect', params: { platform } } as const;
  else if (platform.wayf) return { name: 'auth/login/wayf', params: { platform } } as const;
  else
    return {
      name: 'auth/login/credentials',
      params: {
        accountId: account?.user.id,
        loginUsed: account === undefined ? loginUsed : undefined,
        platform,
      },
    } as const;
};

/**
 * Return the navigation action to be performed when login requirement is recieved.
 * @param requirement
 * @returns
 */
export const getRouteForRequirement = (
  account: AuthActiveAccountWithCredentials | AuthActiveAccountWithSaml,
  requirement: AuthRequirement,
) => {
  switch (requirement) {
    case AuthRequirement.MUST_CHANGE_PASSWORD:
      return {
        name: 'auth/requirement-reset-password',
      } as const;
    case AuthRequirement.MUST_VALIDATE_TERMS:
    case AuthRequirement.MUST_REVALIDATE_TERMS:
      return {
        name: 'auth/revalidate-terms',
      } as const;
    case AuthRequirement.MUST_VERIFY_MOBILE:
      return {
        name: 'auth/change-mobile',
        params: {
          defaultMobile: account.user.mobile,
          platform: account.platform,
        },
      } as const;
    case AuthRequirement.MUST_VERIFY_EMAIL:
      return {
        name: 'auth/change-email',
        params: {
          defaultEmail: account.user.email,
          platform: account.platform,
        },
      } as const;
  }
};

export const getRouteForRedirect = (platform: Platform, pending: AuthState['pending'] | undefined) => {
  switch (pending?.redirect) {
    case AuthPendingRedirection.ACTIVATE:
      return {
        name: 'auth/activation',
        params: {
          credentials: {
            password: pending.code,
            username: pending.loginUsed,
          },
          platform,
        },
      } as const;
    case AuthPendingRedirection.RENEW_PASSWORD:
      return {
        name: 'auth/renew-password',
        params: {
          credentials: {
            password: pending.code,
            username: pending.loginUsed,
          },
          host: platform.name,
          // replaceAccountId: pending.accountId,
          // replaceAccountTimestamp: pending.accountTimestamp,
        },
      } as const;
  }
};

/**
 * get navigation state from redux data.
 * If newly returned state differs from the previous one, it must be reset into navigation container
 * This methods returns the new navigationState + a navigationKey which tells if the navigation state must be reset
 */
export const getAuthReduxNavigationState = ({
  accounts,
  connected,
  lastDeletedAccount,
  pending,
  requirement,
  showOnboarding,
}: Pick<AuthState, 'connected' | 'accounts' | 'lastDeletedAccount' | 'pending' | 'requirement' | 'showOnboarding'>): PartialState<
  NavigationState<NavigationRootParams>
> => {
  // A. Activation & Password Renew
  if (pending) {
    const routeForLoginRedirection = getRouteForRedirect(appConf.getHost(pending.platform), pending);
    if (routeForLoginRedirection) return { routes: [routeForLoginRedirection], stale: true };
  }

  // B. Requirements
  if (requirement && connected && accountIsActive(accounts[connected])) {
    const routeForRequirement = getRouteForRequirement(accounts[connected], requirement);
    return { routes: [routeForRequirement], stale: true };
  }

  // C. Onboarding
  if (showOnboarding) {
    return { routes: [{ name: 'auth/onboarding' }], stale: true };
  }

  // D.1. Platforms / Multi-account selector
  const accountIds = Object.keys(accounts);
  const nbAccounts = Object.values(accounts).length;
  const state: PartialState<NavigationState<NavigationRootParams>> = { routes: [], stale: true };

  if (nbAccounts > 0 && nbAccounts + (lastDeletedAccount ? 1 : 0) > 1) {
    state.routes.push({ name: 'auth/accounts' });
  } else if (appConf.hasMultiplePlatform) {
    state.routes.push({ name: 'auth/platforms' });
  } else {
    // zero or one account & only one platform -> no screen
  }

  // D.2. Login screen (Credentials / Wayf)
  const accountId = accountIds.length === 1 ? accountIds[0] : pending && 'account' in pending ? pending.account : undefined;
  const account = accountId ? accounts[accountId] : undefined;
  const hostName = account?.platform
    ? typeof account.platform === 'string'
      ? account.platform
      : account.platform.name
    : pending?.platform;
  if (hostName) {
    state.routes.push(getRouteForLoginRedirection(appConf.getHost(hostName), account, pending?.loginUsed));
  }

  return state;
};
