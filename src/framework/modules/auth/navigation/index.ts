/**
 * Navigator for the auth section
 */
import { CommonActions, NavigationProp, ParamListBase, StackRouter } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ILoginResult } from '~/framework/modules/auth/actions';
import { ForgotMode, IAuthContext, IAuthCredentials, PartialSessionScenario } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/moduleConfig';
import type { AuthChangeEmailScreenNavParams } from '~/framework/modules/auth/screens/change-email';
import type { AuthChangeMobileScreenNavParams } from '~/framework/modules/auth/screens/change-mobile';
import type { ChangePasswordScreenNavParams } from '~/framework/modules/auth/screens/change-password/types';
import type { LoginHomeScreenNavParams } from '~/framework/modules/auth/screens/login-home/types';
import type { AuthMFAScreenNavParams } from '~/framework/modules/auth/screens/mfa';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

// We use moduleConfig.name instead of moduleConfig.routeName because this module is not technically a NavigableModule.
export const authRouteNames = {
  loginHome: `${moduleConfig.name}/login/home` as 'loginHome',
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
  loginHome: LoginHomeScreenNavParams;
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

export const getLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? authRouteNames.loginWayf : authRouteNames.loginHome;
};

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
      case 'reset':
        return CommonActions.navigate(authRouteNames.changePassword, {
          platform,
          context: action.context,
          credentials: action.credentials,
          rememberMe: action.rememberMe,
          useResetCode: true,
        });
      case PartialSessionScenario.MUST_CHANGE_PASSWORD:
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
      case PartialSessionScenario.MUST_REVALIDATE_TERMS:
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
      case PartialSessionScenario.MUST_VERIFY_MOBILE:
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
      case PartialSessionScenario.MUST_VERIFY_EMAIL:
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

export const getAuthNavigationState = (selectedPlatform?: Platform, loginRedirect?: ILoginResult) => {
  const routes = [] as RouteStack;

  // 1. Pre-login screens

  routes.push({ name: authRouteNames.onboarding });

  if (appConf.platforms.length > 1 && (selectedPlatform || !routes.length)) routes.push({ name: authRouteNames.platforms });

  if (selectedPlatform || !routes.length)
    routes.push({
      name: getLoginRouteName(selectedPlatform),
      params: {
        platform: selectedPlatform || appConf.platforms[0], // Auto-select first platform if not defined
      },
    });

  // 2. post-login screens (if loginRedirect provided only)

  if (!loginRedirect || !selectedPlatform) return { routes };

  // Okay time for explanation !
  // { routes } are "stale" navigation state and must be rehyrated to apply `navAction` on it.
  // We create a dummy StackRouter to perform this, then returns the resulting navState.
  const navAction = getRedirectLoginNavAction(loginRedirect, selectedPlatform);
  if (!navAction) return { routes };

  const router = StackRouter({});
  const routeNames = Object.values(authRouteNames);
  const rehydratedState = router.getRehydratedState({ routes }, { routeNames, routeParamList: {}, routeGetIdList: {} });
  const newState = router.getStateForAction(rehydratedState, navAction, { routeNames, routeParamList: {}, routeGetIdList: {} });

  return newState ?? { routes };
};
