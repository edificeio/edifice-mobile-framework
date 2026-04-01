import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthActiveAccount, AuthSavedAccount } from './model';

import type authModule from '.';

import { ModuleNavigationParams } from '~/app/module/types';
import appConf, { type Platform } from '~/framework/util/appConf';

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getNavActionForOnboarding = <RouteName extends keyof ModuleNavigationParams<typeof authModule>>(
  _navigation: NativeStackScreenProps<ModuleNavigationParams<typeof authModule>, RouteName>['navigation'],
): Parameters<typeof _navigation.dispatch>[0] => {
  return appConf.hasMultiplePlatform ? CommonActions.navigate('auth/platforms') : CommonActions.navigate('auth/login');
};

/**
 * Return the navigation action to be performed when selecting a platform.
 * No account information can be provided, as selecting a platform allow any user to log in.
 * @param platform
 * @returns
 */
export const getNavActionForPlatformSelect = <RouteName extends keyof ModuleNavigationParams<typeof authModule>>(
  _navigation: NativeStackScreenProps<ModuleNavigationParams<typeof authModule>, RouteName>['navigation'],
  platform: Platform,
): Parameters<typeof _navigation.dispatch>[0] => {
  return getNavActionsForLoginRedirection(_navigation, platform);
};

/**
 * Return the navigation actions to be performed for returning to the login screen of the given platform.
 * The result is an array in case multiple actions must be performed
 * @param platform
 * @param account Saved account information to skip identification input for the user.
 * @param loginUsed When account is not provided, given loginUsed will be passed to the screen as a param.
 * @returns
 */
export const getNavActionsForLoginRedirection = <RouteName extends keyof ModuleNavigationParams<typeof authModule>>(
  _navigation: NativeStackScreenProps<ModuleNavigationParams<typeof authModule>, RouteName>['navigation'],
  platform: Platform,
  account?: Pick<AuthSavedAccount | AuthActiveAccount, 'method'> & {
    user: Pick<(AuthSavedAccount | AuthActiveAccount)['user'], 'id'>;
  },
  loginUsed?: string,
): Parameters<typeof _navigation.dispatch>[0] => {
  if (platform.redirect) return CommonActions.navigate('auth/login/redirect', { platform });
  else if (platform.wayf) return CommonActions.navigate('auth/login/wayf', { platform });
  else
    return CommonActions.navigate('auth/login/credentials', {
      accountId: account?.user.id,
      loginUsed: account === undefined ? loginUsed : undefined,
      platform,
    });
};
