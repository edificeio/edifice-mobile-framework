import { CommonActions, NavigationState, PartialState, StackActions } from '@react-navigation/native';

import { RouteStack } from '~/framework/navigation/helper';
import { StackNavigationAction } from '~/framework/navigation/types';
import appConf, { Platform } from '~/framework/util/appConf';

import { authRouteNames, simulateNavAction } from '..';
import { AuthPendingRedirection, AuthRequirement } from '../../model';
import { AuthPendingRestore, IAuthState, getPlatform, getSession } from '../../reducer';

/** @deprecated */
export const getLoginRouteName = (platform?: Platform) => {
  return platform?.wayf ? authRouteNames.loginWayf : authRouteNames.loginCredentials;
};

export const getLoginNextScreen: (platform: Platform) => PartialState<NavigationState>['routes'][0] = platform => {
  return platform.wayf
    ? { name: authRouteNames.loginWayf, params: { platform } }
    : { name: authRouteNames.loginCredentials, params: { platform } };
};

export const getLoginNextScreenNavAction = (platform: Platform) => {
  return CommonActions.navigate(getLoginNextScreen(platform));
};

export const getOnboardingNextScreen = () => {
  return appConf.hasMultiplePlatform
    ? CommonActions.navigate({ name: authRouteNames.platforms })
    : CommonActions.navigate(getLoginNextScreen(appConf.platforms[0]));
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
  lastDeletedAccount: IAuthState['lastDeletedAccount'],
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
  if (multipleAccounts || (lastDeletedAccount && accountsAsArray.length)) {
    // Push account select here
    routes.push({ name: authRouteNames.accountSelection });
  } else if (appConf.hasMultiplePlatform) {
    routes.push({ name: authRouteNames.platforms });
  } // if single account && single platform, do not push any routes

  // 3 - Login Screen
  // 3.1 – Get actual platform object or name corresponding to the auth state + login if possible
  let foundPlatform: string | Platform | undefined = !appConf.hasMultiplePlatform ? allPlatforms[0] : undefined;
  // let login: string | undefined;

  let accountId: keyof IAuthState['accounts'] | undefined;

  if (pending) {
    foundPlatform = pending.platform;
    if (pending.redirect === undefined) {
      // Session restore
      const loggingAccount = pending.account ? accounts[pending.account] : undefined;
      if (loggingAccount) {
        foundPlatform = loggingAccount.platform;
        // login = loggingAccount.user.loginUsed;
        accountId = loggingAccount.user.id;
      }
    } else {
      // Activation && password renew
      // login = pending.loginUsed;
    }
  } else if (!lastDeletedAccount) {
    const singleAccountId = Object.keys(accounts).length === 1 ? Object.keys(accounts)[0] : undefined;
    if (singleAccountId) {
      foundPlatform = accounts[singleAccountId].platform;
      accountId = singleAccountId;
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
  if (platform && (accountsAsArray.length <= 1 || (pending as AuthPendingRestore)?.account)) {
    const nextScreen = getLoginNextScreen(platform);
    routes.push({ ...nextScreen, params: { ...nextScreen.params, accountId } });
  }

  // 4 – Requirement & login redirections
  // 4.1 – Get corresponding nav action action
  let navRedirection: StackNavigationAction | undefined;
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

export const getFirstTabRoute = () => ({
  stale: true as const,
  routes: [
    {
      name: '$tabs',
      state: {
        routes: [
          {
            name: '$tab.timeline',
            state: {
              routes: [
                {
                  name: 'timeline',
                },
              ],
            },
          },
        ],
      },
    },
  ],
});
