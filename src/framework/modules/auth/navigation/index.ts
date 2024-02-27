/**
 * Navigator for the auth section
 */
import {
  CommonActions,
  ParamListBase,
  Router,
  StackActionType,
  StackActions,
  StackNavigationState,
  StackRouter,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthCredentials, AuthPendingRedirection, AuthRequirement, ForgotMode } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import { AuthAccountSelectionScreenNavParams } from '~/framework/modules/auth/screens/account-selection/types';
import type { AuthAddAccountModalScreenNavParams } from '~/framework/modules/auth/screens/add-account-modal';
import type { AuthChangeEmailScreenNavParams } from '~/framework/modules/auth/screens/change-email';
import type { AuthChangeMobileScreenNavParams } from '~/framework/modules/auth/screens/change-mobile';
import type { ChangePasswordScreenNavParams } from '~/framework/modules/auth/screens/change-password/types';
import type { LoginCredentialsScreenNavParams } from '~/framework/modules/auth/screens/login-credentials/types';
import type { AuthMFAScreenNavParams } from '~/framework/modules/auth/screens/mfa';
import type { AuthOnboardingScreenNavParams } from '~/framework/modules/auth/screens/onboarding';
import type { AuthOnboardingAddAccountScreenNavParams } from '~/framework/modules/auth/screens/onboarding-add-account';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

import { IAuthState, getPlatform, getSession } from '../reducer';
import { AuthDiscoveryClassScreenNavParams } from '../screens/discovery-class';

// We use moduleConfig.name instead of moduleConfig.routeName because this module is not technically a NavigableModule.
export const authRouteNames = {
  // Login stack (normal version)
  onboarding: `${moduleConfig.name}/onboarding` as 'onboarding',
  platforms: `${moduleConfig.name}/platforms` as 'platforms',
  loginCredentials: `${moduleConfig.name}/login/credentials` as 'loginCredentials',
  loginWayf: `${moduleConfig.name}/login/wayf` as 'loginWayf',
  wayf: `${moduleConfig.name}/wayf` as 'wayf',
  activation: `${moduleConfig.name}/activation` as 'activation',
  changePassword: `${moduleConfig.name}/changePassword` as 'changePassword',
  forgot: `${moduleConfig.name}/forgot` as 'forgot',
  accountSelection: `${moduleConfig.name}/accountSelection` as 'accountSelection', // This screen is exclusive to normal login stack
  // Login stack (add account version)
  addAccountOnboarding: `${moduleConfig.name}/add-account/onboarding` as 'addAccountOnboarding',
  addAccountPlatforms: `${moduleConfig.name}/add-account/platforms` as 'addAccountPlatforms',
  addAccountLoginCredentials: `${moduleConfig.name}/add-account/login/credentials` as 'addAccountLoginCredentials',
  addAccountLoginWayf: `${moduleConfig.name}/add-account/login/wayf` as 'addAccountLoginWayf',
  addAccountWayf: `${moduleConfig.name}/add-account/wayf` as 'addAccountWayf',
  addAccountActivation: `${moduleConfig.name}/add-account/activation` as 'addAccountActivation',
  addAccountChangePassword: `${moduleConfig.name}/add-account/changePassword` as 'addAccountChangePassword',
  addAccountForgot: `${moduleConfig.name}/add-account/forgot` as 'addAccountForgot',
  // Exclusive logged screen (normal auth stack)
  addAccountModal: `${moduleConfig.name}/add-account/modal` as 'addAccountModal', // This is the add acount stack parent screen.
  revalidateTerms: `${moduleConfig.name}/revalidateTerms` as 'revalidateTerms',
  changePasswordModal: `${moduleConfig.name}/changePasswordModal` as 'changePasswordModal',
  changeEmail: `${moduleConfig.name}/changeEmail` as 'changeEmail',
  changeMobile: `${moduleConfig.name}/changeMobile` as 'changeMobile',
  mfa: `${moduleConfig.name}/mfa` as 'mfa',
  mfaModal: `${moduleConfig.name}/mfaModal` as 'mfaModal',
  discoveryClass: `${moduleConfig.name}/discovery-class` as 'discoveryClass',
};

export interface AuthNavigationParams extends ParamListBase {
  // Normal auth stack
  onboarding: AuthOnboardingScreenNavParams;
  platforms: undefined;
  accountSelection: AuthAccountSelectionScreenNavParams;
  loginCredentials: LoginCredentialsScreenNavParams;
  loginWayf: { platform: Platform };
  wayf: { platform: Platform };
  activation: { platform: Platform; credentials: AuthCredentials };
  changePassword: ChangePasswordScreenNavParams;
  forgot: { platform: Platform; mode: ForgotMode; login?: string };
  // Add account stack
  addAccountModal: AuthAddAccountModalScreenNavParams;
  addAccountOnboarding: AuthOnboardingAddAccountScreenNavParams;
  addAccountPlatforms: undefined;
  addAccountLoginCredentials: LoginCredentialsScreenNavParams;
  addAccountLoginWayf: { platform: Platform };
  addAccountWayf: { platform: Platform };
  addAccountActivation: { platform: Platform; credentials: AuthCredentials };
  addAccountChangePassword: ChangePasswordScreenNavParams;
  addAccountForgot: { platform: Platform; mode: ForgotMode; login?: string };
  // Exclusive logged screen
  revalidateTerms: object;
  changePasswordModal: ChangePasswordScreenNavParams;
  changeEmail: AuthChangeEmailScreenNavParams;
  changeMobile: AuthChangeMobileScreenNavParams;
  mfa: AuthMFAScreenNavParams;
  mfaModal: AuthMFAScreenNavParams;
  discoveryClass: AuthDiscoveryClassScreenNavParams;
}

/**
 * Get the right login route name for the given platfoem (credential /// wayf)
 * @param platform
 * @returns
 */
export const getLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? authRouteNames.loginWayf : authRouteNames.loginCredentials;
};

export const getAddAccountLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? authRouteNames.addAccountLoginWayf : authRouteNames.addAccountLoginCredentials;
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
    case AuthRequirement.MUST_REVALIDATE_TERMS:
      return CommonActions.reset({
        routes: [
          {
            name: authRouteNames.revalidateTerms,
          },
        ],
      });
    case AuthRequirement.MUST_VERIFY_MOBILE:
      return CommonActions.reset({
        routes: [
          {
            name: authRouteNames.changeMobile,
            params: {
              platform: getPlatform(),
              defaultMobile: getSession()?.user.mobile,
            },
          },
        ],
      });
    case AuthRequirement.MUST_VERIFY_EMAIL:
      return CommonActions.reset({
        routes: [
          {
            name: authRouteNames.changeEmail,
            params: {
              platform: getPlatform(),
              defaultEmail: getSession()?.user.email,
            },
          },
        ],
      });
  }
};

export const getNavActionForRedirect = (platform: Platform, pending: IAuthState['pending'] | undefined) => {
  switch (pending?.redirect) {
    case AuthPendingRedirection.ACTIVATE:
      return StackActions.push(authRouteNames.activation, {
        platform,
        credentials: {
          username: pending.loginUsed,
          password: pending.code,
        },
      });
    // // Uncomment this block to make a reset state instead of a push, making impossible to go back
    // return CommonActions.reset({
    //   routes: [
    //     {
    //       name: authRouteNames.activation,
    //       params: {
    //         platform,
    //         credentials: {
    //           username: pending.loginUsed,
    //           password: pending.code,
    //         },
    //       },
    //     },
    //   ],
    // });
    case AuthPendingRedirection.RENEW_PASSWORD:
      return StackActions.push(authRouteNames.changePassword, {
        platform,
        credentials: {
          username: pending.loginUsed,
          password: pending.code,
        },
        useResetCode: true,
      });
  }
};

/**
 * Dispatch the right nav action after onboarding, depending on platform configuration
 * @param navigation
 */
export function navigateAfterOnboarding(navigation: NativeStackNavigationProp<AuthNavigationParams>) {
  if (appConf.hasMultiplePlatform) {
    navigation.navigate(authRouteNames.platforms);
  } else {
    const pf = appConf.platforms[0];
    navigation.navigate(getLoginRouteName(pf), { platform: pf }); // Auto-select first platform if not defined));
  }
}

export const getOnboardingNextScreen = () => {
  return appConf.hasMultiplePlatform
    ? CommonActions.navigate({ name: authRouteNames.platforms })
    : CommonActions.navigate({ name: getLoginRouteName(appConf.platforms[0]), params: { platform: appConf.platforms[0] } });
};

export const getAddAccountOnboardingNextScreen = () => {
  return appConf.hasMultiplePlatform
    ? CommonActions.navigate({ name: authRouteNames.addAccountPlatforms })
    : CommonActions.navigate({
        name: getAddAccountLoginRouteName(appConf.platforms[0]),
        params: { platform: appConf.platforms[0] },
      });
};

/**
 * Simulate a nav action from the given nav state and returns the resulting nav state
 * @param action the nav action to simulate
 * @param state nav state (can be stale) to apply the nav action on
 * @returns The new nav State (will be rehydrated)
 */
export const simulateNavAction = (
  action: CommonActions.Action | StackActionType,
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

  // 1 - Onboarding

  if (!pending && showOnboarding) {
    routes.push({ name: authRouteNames.onboarding });
    return;
  }

  // 2 - Platform Select / Account Select

  const accountsAsArray = Object.values(accounts);
  const multipleAccounts = accountsAsArray.length > 1;
  if (multipleAccounts) {
    // Push account select here
  } else if (appConf.hasMultiplePlatform) {
    routes.push({ name: authRouteNames.platforms });
  } // if single account && single platform, do not push any routes

  // 3 - Login Screen

  // 3.1 – Get actual platform object or name corresponding to the auth state + login if possible
  let foundPlatform: string | Platform | undefined = !appConf.hasMultiplePlatform ? allPlatforms[0] : undefined;
  let login: string | undefined;
  if (pending) {
    foundPlatform = pending.platform;
    if (pending.redirect === undefined) {
      // Session restore
      const loggingAccount = pending.account ? accounts[pending.account] : undefined;
      if (loggingAccount) {
        foundPlatform = loggingAccount.platform;
        login = loggingAccount.user.loginUsed;
      }
    } else {
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

  // 4 – Requirement & login redirections

  // 4.1 – Get corresponding nav action action
  let navRedirection: CommonActions.Action | StackActionType | undefined;
  if (requirement) {
    navRedirection = getNavActionForRequirement(requirement);
  } else if (platform && pending?.redirect !== undefined) {
    navRedirection = getNavActionForRedirect(platform, pending);
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
