import { CommonActions, NavigationState, PartialState, StackActionType } from '@react-navigation/native';

import { authRouteNames, simulateNavAction } from '~/framework/modules/auth/navigation';
import { IAuthState } from '~/framework/modules/auth/reducer';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

import { getLoginRouteName, getNavActionForRedirect } from './router-main-account';

export const getAddAccountLoginNextScreen: (platform: Platform) => PartialState<NavigationState>['routes'][0] = platform => {
  return platform.wayf
    ? { name: authRouteNames.addAccountLoginWayf, params: { platform } }
    : { name: authRouteNames.addAccountLoginCredentials, params: { platform } };
};

export const getAddAccountLoginNextScreenNavAction = (platform: Platform) => {
  return CommonActions.navigate(getAddAccountLoginNextScreen(platform));
};

export const getAddAccountOnboardingNextScreen = () => {
  return appConf.hasMultiplePlatform
    ? CommonActions.navigate({ name: authRouteNames.addAccountPlatforms })
    : CommonActions.navigate(getAddAccountLoginNextScreen(appConf.platforms[0]));
};

export const getAddAccountNavigationState = (pending: IAuthState['pending']) => {
  const routes = [] as RouteStack;
  const allPlatforms = appConf.platforms;

  routes.push({ name: authRouteNames.addAccountOnboarding });

  // 4 – Requirement & login redirections
  // 4.1 – Get corresponding nav action action
  let navRedirection: CommonActions.Action | StackActionType | undefined;
  if (pending?.redirect !== undefined) {
    // 2 - Platform Select / Account Select
    if (appConf.hasMultiplePlatform) {
      routes.push({ name: authRouteNames.platforms });
    } // if single account && single platform, do not push any routes

    // 3 - Login Screen
    // 3.1 – Get actual platform object or name corresponding to the auth state + login if possible
    let foundPlatform: string | Platform | undefined = !appConf.hasMultiplePlatform ? allPlatforms[0] : undefined;
    let login: string | undefined;
    if (pending) {
      foundPlatform = pending.platform;
      if (pending.redirect !== undefined) {
        // Activation && password renew
        login = pending.loginUsed;
      }
    }

    // 3.2 – Get the actual platform object to be loaded
    const platform: Platform | undefined = appConf.hasMultiplePlatform
      ? foundPlatform
        ? typeof foundPlatform === 'string'
          ? allPlatforms.find(item => item.name === foundPlatform)
          : foundPlatform
        : undefined // Silenty go to the select page if the platform name has no correspondance.
      : allPlatforms[0];

    // 3.3 – Put the platform route into the stack
    if (platform || !routes.length)
      routes.push({
        name: getLoginRouteName(platform),
        params: {
          platform,
          login,
        },
      });

    if (platform) navRedirection = getNavActionForRedirect(platform, pending);
  }

  // 4.2 – Apply redirection
  // We must add `stale = false` into the resulting state to make React Navigation reinterpret and rehydrate this state if necessary.
  // @see https://reactnavigation.org/docs/navigation-state/#partial-state-objects
  if (navRedirection) {
    return { ...simulateNavAction(navRedirection, { routes }), stale: true as const };
  } else {
    return { stale: true as const, routes, index: routes.length - 1 };
  }
};
