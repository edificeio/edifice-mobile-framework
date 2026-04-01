import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type authModule from '.';

import { ModuleNavigationParams } from '~/app/module/types';
import appConf, { Platform } from '~/framework/util/appConf';

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
  return getNavActionsForLoginRedirection(platform);
};
