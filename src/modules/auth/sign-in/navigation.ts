import React from 'react';

import { type NavigationState, type PartialState, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ModuleModals, ModuleScreens, NavigationParamsOfScreens } from '~/app/module';
import appConf, { Platform } from '~/framework/util/appConf';
import type { AuthMixedAccountMap } from '~/modules/auth/model';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { type SignInStatus, useSignInStore } from '~/modules/auth/store/sign-in';

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
 * @param accountId Saved account to log in again, to skip identification input for the user.
 * @param loginUsed When account is not provided, given loginUsed will be passed to the screen as a param.
 * @returns
 */
export const getRouteForLoginRedirection = (platform: Platform['name'], accountId?: string, loginUsed?: string) => {
  const { redirect, wayf } = appConf.assertPlatformOfName(platform);
  if (redirect) return { name: 'sign-in/redirect', params: { platform } } as const;
  else if (wayf) return { name: 'sign-in/wayf-intro', params: { accountId, platform } } as const;
  else
    return {
      name: 'sign-in/credentials',
      params: {
        accountId,
        loginUsed: accountId === undefined ? loginUsed : undefined,
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
      return { name: 'sign-in/activation', params: { credentials, platform: status.platform } } as const;
    case 'passwordRenew':
      return {
        name: 'sign-in/renew-password',
        params: { accountId: status.accountId, credentials, platform: status.platform },
      } as const;
  }
};

/**
 * Get the navigation state of the sign-in navigator from the sign-in situation (accounts + sign-in status).
 * If newly returned state differs from the previous one, it must be reset into navigation container (see `navigation-container.tsx`).
 *
 * While `showWelcome` is true (until the user signed in once), the welcome screen comes first, so the user can go back to it.
 * Then the user lands on the screen of its situation:
 * - fresh start (no account, no status): welcome screen, or platforms / login screen if the welcome screen is not shown anymore
 *   (e.g. all the accounts were removed)
 * - activation / password renew code: matching screen
 * - saved accounts: accounts selection (several accounts) or login screen of the account / platform
 */
export const getSignInNavigationState = ({
  accounts,
  lastDeletedAccount,
  showWelcome,
  status,
}: {
  accounts: AuthMixedAccountMap;
  lastDeletedAccount?: string;
  /** The welcome screen comes first, until the user signed in once (see `showWelcome` of the accounts store). */
  showWelcome: boolean;
  status?: SignInStatus;
}): PartialState<NavigationState> => {
  const routes: PartialState<NavigationState>['routes'] = showWelcome ? [{ name: 'sign-in/welcome' }] : [];
  const accountIds = Object.keys(accounts);
  const nbAccounts = accountIds.length;

  // A. Activation & Password renew
  if (status?.type === 'activation' || status?.type === 'passwordRenew') {
    routes.push(getRouteForOneTimeCode(status));
    return { routes, stale: true };
  }

  // B. Nothing to start from: the welcome screen, or if it is not shown anymore the way to log in.
  if (nbAccounts === 0 && !status) {
    if (!showWelcome) routes.push(getRouteForOnboarding());
    return { routes, stale: true };
  }

  // C.1. Platforms / Multi-account selector
  if (nbAccounts > 0 && nbAccounts + (lastDeletedAccount ? 1 : 0) > 1) {
    routes.push({ name: 'sign-in/accounts' });
  } else if (appConf.hasMultiplePlatform) {
    routes.push({ name: 'sign-in/platforms' });
  }

  // C.2. Login screen (Credentials / Wayf / Redirect)
  const accountId = nbAccounts === 1 ? accountIds[0] : status?.accountId;
  const account = accountId ? accounts[accountId] : undefined;
  const platform = account?.platform
    ? typeof account.platform === 'string'
      ? account.platform
      : account.platform.name
    : status?.platform;
  // After an account deletion, the accounts selector is shown instead of the login screen of the remaining account,
  // unless there is a sign-in status (failed restore, password renew...): then the login screen must show up with the error.
  if (platform && (!lastDeletedAccount || status)) {
    routes.push(getRouteForLoginRedirection(platform, account?.user.id, status?.loginUsed));
  }

  return { routes, stale: true };
};

/** Keeps the same navigation state object while the screens to show do not change, so the navigation is not reset for nothing. */
const useStableNavigationState = (state: PartialState<NavigationState>, attempt: number) => {
  // `attempt` makes the state change when the same status is set again (e.g. a second failed restore of the same account).
  const key = `${attempt}:${JSON.stringify(state)}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => state, [key]);
};

/**
 * Navigation state of the sign-in screens when an account is loaded (no account connected), computed from the sign-in
 * situation (accounts + sign-in status).
 * The state only changes if the screens to show actually change, so the navigation is not reset by unrelated store updates
 * (token refresh...).
 */
export const useLoadAccountNavigationState = () => {
  const accounts = useAccountsStore(s => s.accounts);
  const lastDeletedAccount = useAccountsStore(s => s.lastDeletedAccount);
  const showWelcome = useAccountsStore(s => s.showWelcome);
  const status = useSignInStore(s => s.status);
  const attempt = useSignInStore(s => s.attempt);
  return useStableNavigationState(getSignInNavigationState({ accounts, lastDeletedAccount, showWelcome, status }), attempt);
};

/**
 * Navigation state of the sign-in screens when an account is added to the existing ones: the saved accounts and the welcome
 * screen are ignored, the user starts from the platforms / login screen.
 * Only an activation / password renew code changes that: it leads to its own screen.
 */
export const useAddAccountNavigationState = () => {
  const status = useSignInStore(s => s.status);
  const attempt = useSignInStore(s => s.attempt);
  const oneTimeCodeStatus = status?.type === 'activation' || status?.type === 'passwordRenew' ? status : undefined;
  return useStableNavigationState(
    getSignInNavigationState({ accounts: {}, showWelcome: false, status: oneTimeCodeStatus }),
    attempt,
  );
};
