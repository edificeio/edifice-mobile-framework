/**
 * Navigator for the auth section
 */
import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  Router,
  StackActionType,
  StackNavigationState,
  StackRouter,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ILoginResult } from '~/framework/modules/auth/actions';
import { AuthRequirement, ForgotMode, IAuthContext, IAuthCredentials } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import { AuthAccountSelectionScreenNavParams } from '~/framework/modules/auth/screens/account-selection/types';
import type { AuthChangeEmailScreenNavParams } from '~/framework/modules/auth/screens/change-email';
import type { AuthChangeMobileScreenNavParams } from '~/framework/modules/auth/screens/change-mobile';
import type { ChangePasswordScreenNavParams } from '~/framework/modules/auth/screens/change-password/types';
import type { LoginCredentialsScreenNavParams } from '~/framework/modules/auth/screens/login-credentials/types';
import type { AuthMFAScreenNavParams } from '~/framework/modules/auth/screens/mfa';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

import { IAuthState } from '../reducer';

// We use moduleConfig.name instead of moduleConfig.routeName because this module is not technically a NavigableModule.
export const authRouteNames = {
  accountSelection: `${moduleConfig.name}/accountSelection` as 'accountSelection',
  loginCredentials: `${moduleConfig.name}/login/credentials` as 'loginCredentials',
  loginWayf: `${moduleConfig.name}/login/wayf` as 'loginWayf',
  wayf: `${moduleConfig.name}/wayf` as 'wayf',
  onboarding: `${moduleConfig.name}/onboarding` as 'onboarding',
  platforms: `${moduleConfig.name}/platforms` as 'platforms',
  activation: `${moduleConfig.name}/activation` as 'activation',
  forgot: `${moduleConfig.name}/forgot` as 'forgot',
  revalidateTerms: `${moduleConfig.name}/revalidateTerms` as 'revalidateTerms',
  changePassword: `${moduleConfig.name}/changePassword` as 'changePassword',
  changePasswordModal: `${moduleConfig.name}/changePasswordModal` as 'changePasswordModal',
  changeEmail: `${moduleConfig.name}/changeEmail` as 'changeEmail',
  changeMobile: `${moduleConfig.name}/changeMobile` as 'changeMobile',
  mfa: `${moduleConfig.name}/mfa` as 'mfa',
  mfaModal: `${moduleConfig.name}/mfaModal` as 'mfaModal',
};

export interface IAuthNavigationParams extends ParamListBase {
  accountSelection: AuthAccountSelectionScreenNavParams;
  loginCredentials: LoginCredentialsScreenNavParams;
  loginWayf: { platform: Platform };
  wayf: { platform: Platform };
  activation: { platform: Platform; context: IAuthContext; credentials: IAuthCredentials; rememberMe?: boolean };
  forgot: { platform: Platform; mode: ForgotMode };
  revalidateTerms: { platform: Platform; credentials?: IAuthCredentials; rememberMe?: boolean };
  changePassword: ChangePasswordScreenNavParams;
  changePasswordModal: ChangePasswordScreenNavParams;
  changeEmail: AuthChangeEmailScreenNavParams;
  changeMobile: AuthChangeMobileScreenNavParams;
  mfa: AuthMFAScreenNavParams;
  mfaModal: AuthMFAScreenNavParams;
}

/**
 * Get the right login route name for the given platfoem (credential /// wayf)
 * @param platform
 * @returns
 */
export const getLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? authRouteNames.loginWayf : authRouteNames.loginCredentials;
};

export const getNavActionForRequirement = (requirement: AuthRequirement) => {
  switch (requirement) {
    case AuthRequirement.MUST_CHANGE_PASSWORD:
      return CommonActions.reset({
        routes: [
          {
            name: authRouteNames.changePassword,
            params: {
              forceChange: true,
            },
          },
        ],
      });
  }
};

/**
 * Returns
 * @param action
 * @param platform
 * @returns
 */
export const getRedirectLoginNavAction = (action: ILoginResult, platform: Platform) => {
  if (action) {
    switch (action.action) {
      case 'activate':
        return CommonActions.navigate(authRouteNames.activation, {
          platform,
          context: action.context,
          credentials: action.credentials,
          rememberMe: action.rememberMe,
        });
      case AuthRequirement.MUST_CHANGE_PASSWORD:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: authRouteNames.changePassword,
              params: {
                platform,
                context: action.context,
                credentials: action.credentials,
                rememberMe: action.rememberMe,
                forceChange: true,
              },
            },
          ],
        });
      case AuthRequirement.MUST_REVALIDATE_TERMS:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: authRouteNames.revalidateTerms,
              params: {
                platform,
                credentials: action.credentials,
                rememberMe: action.rememberMe,
              },
            },
          ],
        });
      case AuthRequirement.MUST_VERIFY_MOBILE:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: authRouteNames.changeMobile,
              params: {
                platform,
                defaultMobile: action.defaultMobile,
                rememberMe: action.rememberMe,
              },
            },
          ],
        });
      case AuthRequirement.MUST_VERIFY_EMAIL:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: authRouteNames.changeEmail,
              params: {
                platform,
                defaultEmail: action.defaultEmail,
                rememberMe: action.rememberMe,
              },
            },
          ],
        });
    }
  }
};

export const redirectLoginNavAction = (
  action: ILoginResult,
  platform: Platform,
  navigation: NavigationProp<IAuthNavigationParams>,
) => {
  const navAction = getRedirectLoginNavAction(action, platform);
  if (navAction) {
    navigation.dispatch(navAction);
  }
};

export function navigateAfterOnboarding(navigation: NativeStackNavigationProp<IAuthNavigationParams>) {
  const hasMultiplePlatforms = appConf.platforms.length > 1;
  if (hasMultiplePlatforms) {
    navigation.navigate(authRouteNames.platforms);
  } else {
    const pf = appConf.platforms[0];
    navigation.navigate(getLoginRouteName(pf), { platform: pf }); // Auto-select first platform if not defined));
  }
}

/**
 * Simulate a nav action from the given nav state and returns the resulting nav state
 * @param action the nav action to simulate
 * @param state nav state (can be stale) to apply the nav action on
 * @returns The new nav State (will be rehydrated)
 */
const simulateNavAction = (
  action: CommonActions.Action,
  state: Parameters<Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>['getRehydratedState']>[0],
) => {
  // We must instaciate a throwaway StackRouter to perform the action on the state and get the resulting one.
  const router = StackRouter({});
  const routeNames = Object.values(authRouteNames);
  const rehydratedState = router.getRehydratedState(state, { routeNames, routeParamList: {}, routeGetIdList: {} });
  const newState = router.getStateForAction(rehydratedState, action, { routeNames, routeParamList: {}, routeGetIdList: {} });
  return newState ?? state;
};

/**
 * Compute Auth navigation state from diven information from redux store
 * @param accounts
 * @param pending
 * @param showOnboarding
 * @returns
 */
export const getAuthNavigationState = (
  accounts: IAuthState['accounts'],
  pending: IAuthState['pending'],
  showOnboarding: IAuthState['showOnboarding'],
  requirement: IAuthState['requirement'],
) => {
  const routes = [] as RouteStack;
  const allPlatforms = appConf.platforms;

  // 1. Onboarding

  if (showOnboarding) routes.push({ name: authRouteNames.onboarding });

  // 2. PlatformSelect

  const multiplePlatforms = allPlatforms.length > 1;
  if (multiplePlatforms) {
    routes.push({ name: authRouteNames.platforms });
  }

  // 2. Login Screen

  // Get platform name from pending auth task
  const platformName = pending && (pending.platform ?? (pending.account && accounts[pending.account]?.platform));
  // Get the corresponding platform data
  const platform = multiplePlatforms
    ? platformName
      ? allPlatforms.find(item => item.name === platformName)
      : undefined // Silenty go to the select page if the platform name has no correspondance.
    : allPlatforms[0];
  // This is not the same screen depending of the platform data (federated or not)
  if (platform || !routes.length)
    routes.push({
      name: getLoginRouteName(platform),
      params: {
        platform,
      },
    });

  // 3. Login redirection for requirements

  let navRedirection: CommonActions.Action | undefined;
  if (requirement) {
    navRedirection = getNavActionForRequirement(requirement);
  }

  // 4. Apply redirection if so

  if (!navRedirection) return { routes };

  return simulateNavAction(navRedirection, { routes });
};
