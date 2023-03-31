/**
 * Navigator for the auth section
 */
import { CommonActions, NavigationProp, ParamListBase, StackRouter } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import I18n from 'i18n-js';

import { ILoginResult } from '~/framework/modules/auth/actions';
import { ForgotMode, IAuthContext, IAuthCredentials, PartialSessionScenario } from '~/framework/modules/auth/model';
import type { AuthChangeEmailScreenNavParams } from '~/framework/modules/auth/screens/change-email';
import type { AuthChangeMobileScreenNavParams } from '~/framework/modules/auth/screens/change-mobile';
import type { ChangePasswordScreenNavParams } from '~/framework/modules/auth/screens/change-password/types';
import type { LoginHomeScreenNavParams } from '~/framework/modules/auth/screens/login-home/types';
import type { AuthMFAScreenNavParams } from '~/framework/modules/auth/screens/mfa';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

export enum AuthRouteNames {
  loginHome = 'LoginHome',
  loginWayf = 'LoginWAYF',
  wayf = 'WAYF',
  onboarding = 'Onboarding',
  platforms = 'PlatformSelect',
  activation = 'Activation',
  forgot = 'Forgot',
  revalidateTerms = 'RevalidateTerms',
  changePassword = 'ChangePassword',
  changeEmail = 'ChangeEmail',
  changeMobile = 'ChangeMobile',
  mfa = 'MFA',
}
export interface IAuthNavigationParams extends ParamListBase {
  [AuthRouteNames.loginHome]: LoginHomeScreenNavParams;
  [AuthRouteNames.loginWayf]: { platform: Platform };
  [AuthRouteNames.wayf]: { platform: Platform };
  [AuthRouteNames.activation]: { platform: Platform; context: IAuthContext; credentials: IAuthCredentials; rememberMe?: boolean };
  [AuthRouteNames.forgot]: { platform: Platform; mode: ForgotMode };
  [AuthRouteNames.revalidateTerms]: { platform: Platform; credentials?: IAuthCredentials; rememberMe?: boolean };
  [AuthRouteNames.changePassword]: ChangePasswordScreenNavParams;
  [AuthRouteNames.changeEmail]: AuthChangeEmailScreenNavParams;
  [AuthRouteNames.changeMobile]: AuthChangeMobileScreenNavParams;
  [AuthRouteNames.mfa]: AuthMFAScreenNavParams;
}

export const getLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? AuthRouteNames.loginWayf : AuthRouteNames.loginHome;
};

export const getRedirectLoginNavAction = (action: ILoginResult, platform: Platform) => {
  if (action) {
    switch (action.action) {
      case 'activate':
        return CommonActions.navigate(AuthRouteNames.activation, {
          platform,
          context: action.context,
          credentials: action.credentials,
          rememberMe: action.rememberMe,
        });
      case PartialSessionScenario.MUST_CHANGE_PASSWORD:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: AuthRouteNames.changePassword,
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
              name: AuthRouteNames.revalidateTerms,
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
              name: AuthRouteNames.changeMobile,
              params: {
                platform,
                context: action.context,
                credentials: action.credentials,
                defaultMobile: action.defaultMobile,
              },
            },
          ],
        });
      case PartialSessionScenario.MUST_VERIFY_EMAIL:
        return CommonActions.reset({
          // we reset instead of navigate to prevent the user from going back or something else
          routes: [
            {
              name: AuthRouteNames.changeEmail,
              params: {
                platform,
                context: action.context,
                credentials: action.credentials,
                defaultEmail: action.defaultEmail,
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
    navigation.navigate(AuthRouteNames.platforms);
  } else {
    const pf = appConf.platforms[0];
    navigation.navigate(getLoginRouteName(pf), { platform: pf }); // Auto-select first platform if not defined));
  }
}

export const getAuthNavigationState = (selectedPlatform?: Platform, loginRedirect?: ILoginResult) => {
  const routes = [] as RouteStack;

  // 1. Pre-login screens

  const onboardingTexts = I18n.t('user.onboardingScreen.onboarding');
  const hasOnboardingTexts = onboardingTexts && onboardingTexts.length;
  const hasMultiplePlatforms = appConf.platforms.length > 1;

  if (hasOnboardingTexts) routes.push({ name: 'Onboarding' });
  if (hasMultiplePlatforms && (selectedPlatform || !routes.length)) routes.push({ name: 'PlatformSelect' });
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
  const routeNames = Object.values(AuthRouteNames);
  const rehydratedState = router.getRehydratedState({ routes }, { routeNames, routeParamList: {}, routeGetIdList: {} });
  const newState = router.getStateForAction(rehydratedState, navAction, { routeNames, routeParamList: {}, routeGetIdList: {} });

  return newState ?? { routes };
};
