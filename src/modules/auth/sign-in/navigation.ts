import React from 'react';

import { type NavigationState, type PartialState, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ModuleModals, ModuleScreens, NavigationParamsOfScreens } from '~/app/module';
import appConf, { Platform } from '~/framework/util/appConf';
import type { SignInStatus } from '~/modules/auth/sign-in/store';

import type signInModule from '.';

/**
 * Params of every route of the auth navigator (sign-in screens + sign-in modals), see `navigation/navigation-container.tsx`.
 */
type AuthParamList = NavigationParamsOfScreens<ModuleScreens<typeof signInModule>> &
  NavigationParamsOfScreens<ModuleModals<typeof signInModule>>;

export type SignInNavigation = NativeStackNavigationProp<AuthParamList, keyof AuthParamList>;

/**
 * Same as `useNavigation`, but typed with the screens of the auth navigator (sign-in module) only.
 */
export const useSignInNavigation = () => {
  return useNavigation<SignInNavigation>();
};

/**
 * Return the navigation action to be performed when leaving the welcome screen, depending on number of platforms available.
 * @returns
 */
export const getRouteForOnboarding = () => {
  return appConf.hasMultiplePlatform
    ? ({ name: 'sign-in/platforms', params: undefined } as const)
    : getRouteForPlatformSelect(appConf.platforms[0].name);
};

/**
 * Return the navigation action to be performed when selecting a platform.
 * No account information can be provided, as selecting a platform allow any user to log in.
 * @param platform name of the platform
 * @returns
 */
export const getRouteForPlatformSelect = (platform: Platform['name']) => {
  return getRouteForLoginRedirection(platform);
};

/**
 * Return the navigation action to be performed for going to the login screen of the given platform.
 * @param platform name of the platform
 * @param accountId Account to sign in again: the sign-in will replace it.
 * @param loginUsed Login to fill in.
 * @param lockLogin The login to fill in can't be changed.
 * @returns
 */
export const getRouteForLoginRedirection = (
  platform: Platform['name'],
  accountId?: string,
  loginUsed?: string,
  lockLogin?: boolean,
) => {
  const { redirect, wayf } = appConf.assertPlatformOfName(platform);
  if (redirect) return { name: 'sign-in/redirect', params: { platform } } as const;
  else if (wayf) return { name: 'sign-in/wayf-intro', params: { accountId, platform } } as const;
  else
    return {
      name: 'sign-in/credentials',
      params: {
        accountId,
        lockLogin,
        loginUsed,
        platform,
      },
    } as const;
};

/**
 * Return the navigation action to be performed when the user used an activation code or a password renew code to log in.
 */
export const getRouteForOneTimeCode = (status: Extract<SignInStatus, { type: 'activation' | 'passwordRenew' }>) => {
  const credentials = { password: status.code, username: status.loginUsed };
  switch (status.type) {
    case 'activation':
      return {
        name: 'sign-in/activation',
        params: { accountId: status.accountId, credentials, platform: status.platform },
      } as const;
    case 'passwordRenew':
      return {
        name: 'sign-in/renew-password',
        params: { accountId: status.accountId, credentials, platform: status.platform },
      } as const;
  }
};

/** The login screen to go to: the platform to sign in to, and what is known about the user (its account, its login). */
export interface SignInLoginTarget {
  platform: Platform['name'];
  /** The account to sign in again, which the sign-in will replace. */
  accountId?: string;
  loginUsed?: string;
  /** The login can't be changed. */
  lockLogin?: boolean;
}

/**
 * Get the navigation state of the sign-in navigator from what the screen that holds it knows. The sign-in knows nothing of the
 * accounts: that screen tells it where the user stands (see `screens/load-account.tsx`).
 * If newly returned state differs from the previous one, it must be reset into navigation container (see `navigation-container.tsx`).
 *
 * While `showWelcome` is true (until the user signed in once), the welcome screen comes first, so the user can go back to it.
 * Then the user lands on the screen of its situation:
 * - fresh start (nothing to go to, no status): welcome screen, or platforms / login screen if the welcome screen is not shown anymore
 *   (e.g. all the accounts were removed). With `showIntroduction` (add-account modal), the introduction screen comes first instead:
 *   it is alone, the user goes on from it
 * - activation / password renew code: matching screen
 * - else the screens of `before` (the accounts selector, for instance), then the login screen of the `login` target, if any. Without
 *   `before`, the choice of the platform comes first if there are several.
 */
export const getSignInNavigationState = ({
  before = [],
  login,
  showIntroduction = false,
  showWelcome = false,
  status,
}: {
  /** Screens to show before the login screen, that the sign-in does not know about. */
  before?: { name: string; params?: object }[];
  /** The login screen to go to. */
  login?: SignInLoginTarget;
  /** The introduction screen (what having several accounts means) comes first. Used by the add-account modal, not by the main sign-in. */
  showIntroduction?: boolean;
  /** The welcome screen comes first, until the user signed in once. */
  showWelcome?: boolean;
  status?: SignInStatus;
}): PartialState<NavigationState> => {
  const firstRoute = showWelcome ? { name: 'sign-in/welcome' } : showIntroduction ? { name: 'sign-in/introduction' } : undefined;
  const routes: PartialState<NavigationState>['routes'] = firstRoute ? [firstRoute] : [];

  // A. Activation & Password renew. The welcome screen stays below (the user can go back to it), the introduction screen does not:
  // the user already is past it, as it leads to the login.
  if (status?.type === 'activation' || status?.type === 'passwordRenew') {
    return { routes: [...(showWelcome ? routes : []), getRouteForOneTimeCode(status)], stale: true };
  }

  // B. Nothing to start from: the welcome (or introduction) screen, or if there is none the way to log in.
  if (!login && before.length === 0 && !status) {
    if (!firstRoute) routes.push(getRouteForOnboarding());
    return { routes, stale: true };
  }

  // C.1. Screens before the login, or the choice of the platform
  if (before.length > 0) routes.push(...before);
  else if (appConf.hasMultiplePlatform) routes.push({ name: 'sign-in/platforms' });

  // C.2. Login screen (Credentials / Wayf / Redirect)
  const platform = login?.platform ?? status?.platform;
  if (platform) {
    routes.push(
      getRouteForLoginRedirection(
        platform,
        login?.accountId ?? status?.accountId,
        login?.loginUsed ?? status?.loginUsed,
        login?.lockLogin,
      ),
    );
  }

  return { routes, stale: true };
};

/**
 * Keeps the same navigation state object while the screens to show do not change, so the navigation is not reset for nothing.
 * `attempt` makes the state change when the same status is set again (e.g. a second failed restore of the same account).
 */
export const useStableNavigationState = (state: PartialState<NavigationState>, attempt: number) => {
  const key = `${attempt}:${JSON.stringify(state)}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => state, [key]);
};
