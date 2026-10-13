import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ModuleModals, ModuleScreens, NavigationParamsOfScreens } from '~/app/module';
import appConf, { Platform } from '~/framework/util/appConf';

import type signInModule from '.';

/**
 * Params of every route of the auth navigator (signIn screens + signIn modals), see `navigation-container.tsx`.
 */
type AuthParamList = NavigationParamsOfScreens<ModuleScreens<typeof signInModule>> &
  NavigationParamsOfScreens<ModuleModals<typeof signInModule>>;

export type SignInNavigation = NativeStackNavigationProp<AuthParamList, keyof AuthParamList>;

/**
 * Same as `useNavigation`, but typed with the screens of the auth navigator (signIn module) only.
 */
export const useSignInNavigation = () => {
  return useNavigation<SignInNavigation>();
};

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getRouteForOnboarding = () => {
  return appConf.hasMultiplePlatform ? ({ name: 'auth/platforms' } as const) : getRouteForPlatformSelect(appConf.platforms[0]);
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
export const getRouteForLoginRedirection = (platform: Platform, accountId?: string, loginUsed?: string) => {
  if (platform.redirect) return { name: 'auth/login/redirect', params: { platform } } as const;
  else if (platform.wayf) return { name: 'auth/login/wayf', params: { platform } } as const;
  else
    return {
      name: 'auth/login/credentials',
      params: {
        accountId: accountId,
        loginUsed: accountId === undefined ? loginUsed : undefined,
        platform,
      },
    } as const;
};
