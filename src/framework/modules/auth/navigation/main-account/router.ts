import { CommonActions, NavigationProp, ParamListBase, StackActions } from '@react-navigation/native';

import { authRouteNames, simulateNavAction } from '..';

import {
  AuthActiveAccount,
  AuthPendingRedirection,
  AuthRequirement,
  AuthSavedAccount,
  AuthSavedLoggedInAccountWithCredentials,
  InitialAuthenticationMethod,
} from '~/framework/modules/auth/model';
import { AuthPendingRestore, getAccountsNumber, getPlatform, getSession, IAuthState } from '~/framework/modules/auth/reducer';
import { StackNavigationAction } from '~/framework/navigation';
import { RouteStack } from '~/framework/navigation/helper';
import appConf, { Platform } from '~/framework/util/appConf';

/**
 * Return the navigation route object corresponding to returning to the login screen of the given platform.
 * @param platform
 * @param account Saved account information to skip identification input for the user.
 * @param loginUsed When account is not provided, given loginUsed will be passed to the screen as a param.
 * @returns
 */
const getNavRoutesForLoginRedirection = (
  platform: Platform,
  account?: Pick<AuthSavedAccount | AuthActiveAccount, 'method'> & {
    user: Pick<(AuthSavedAccount | AuthActiveAccount)['user'], 'id'>;
  },
  loginUsed?: string,
) => {
  if (platform.redirect)
    return [
      {
        name: authRouteNames.loginRedirect,
        params: { platform },
      },
    ];
  if (platform.wayf) {
    if (account?.method === InitialAuthenticationMethod.LOGIN_PASSWORD) {
      if (getAccountsNumber() > 1) {
        // If we have multiple accounts, just put the login crentials screen. The user can go back to account-select screen and manage accounts.
        return [
          {
            name: authRouteNames.loginCredentials,
            params: { accountId: account.user.id, loginUsed: account === undefined ? loginUsed : undefined, platform },
          },
        ];
      } else {
        // If we have only one account, we have to put the login wayf screen before to allow user change account.
        // Note that the loginWayf screen has NOT accountId param to prevent login to be pre-written for guest accounts.
        return [
          { name: authRouteNames.loginWayf, params: { platform } },
          {
            name: authRouteNames.loginCredentials,
            params: { accountId: account.user.id, loginUsed: account === undefined ? loginUsed : undefined, platform },
          },
        ];
      }
    } else {
      return [{ name: authRouteNames.loginWayf, params: { platform } }];
    }
  } else {
    if (account) {
      return [
        {
          name: authRouteNames.loginCredentials,
          params: { accountId: account.user.id, loginUsed: account === undefined ? loginUsed : undefined, platform },
        },
      ];
    } else {
      return [
        {
          name: authRouteNames.loginCredentials,
          params: { loginUsed: account === undefined ? loginUsed : undefined, platform },
        },
      ];
    }
  }
};

/**
 * Return the navigation actions to be performed for returning to the login screen of the given platform.
 * The result is an array in case multiple actions must be performed
 * @param platform
 * @param account Saved account information to skip identification input for the user.
 * @param loginUsed When account is not provided, given loginUsed will be passed to the screen as a param.
 * @returns
 */
export const getNavActionsForLoginRedirection = (
  platform: Platform,
  account?: Pick<AuthSavedAccount | AuthActiveAccount, 'method'> & {
    user: Pick<(AuthSavedAccount | AuthActiveAccount)['user'], 'id'>;
  },
  loginUsed?: string,
) => {
  return getNavRoutesForLoginRedirection(platform, account, loginUsed).map(r => CommonActions.navigate(r));
};

/**
 * Return the navigation action to be performed when selecting a platform.
 * No account information can be provided, as selecting a platform allow any user to log in.
 * @param platform
 * @returns
 */
export const getNavActionForPlatformSelect = (platform: Platform) => {
  return getNavActionsForLoginRedirection(platform);
};

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getNavActionForOnboarding = () => {
  return appConf.hasMultiplePlatform
    ? CommonActions.navigate({ name: authRouteNames.platforms })
    : getNavActionsForLoginRedirection(appConf.platforms[0]);
};

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getNavActionForAccountSwitch = (
  account: Pick<AuthSavedAccount | AuthActiveAccount, 'platform' | 'method' | 'user'>,
) => {
  const platform = appConf.getExpandedPlatform(account.platform);
  if (!platform) return undefined;
  return getNavActionsForLoginRedirection(platform, account);
};

/**
 * Return the navigation action to be performed when leaving the onboarding screen, depending on number of platforms available.
 * @returns
 */
export const getNavActionForAccountLoad = (account: {
  id: (AuthSavedAccount | AuthActiveAccount)['user']['id'];
  platform: Platform | undefined;
  login: Partial<AuthSavedLoggedInAccountWithCredentials['user']>['loginUsed'];
  method: InitialAuthenticationMethod | undefined;
}) => {
  if (!account.platform) return undefined;
  return getNavActionsForLoginRedirection(account.platform, { method: account.method, user: { id: account.id } }, account.login);
};

/**
 * Dispatch given actions, can work with multiple actions as an array.
 * @param navigation
 * @param actions
 */
export const navigationDispatchMultiple = (
  navigation: NavigationProp<ParamListBase>,
  actions: (CommonActions.Action | StackNavigationAction)[] | CommonActions.Action | StackNavigationAction,
) => {
  if (Array.isArray(actions)) {
    actions.forEach(a => {
      navigation.dispatch(a);
    });
  } else {
    navigation.dispatch(actions);
  }
};

/**
 * Return the navigation action to be performed when login requirement is recieved.
 * @param requirement
 * @returns
 */
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
              defaultMobile: getSession()?.user.mobile,
              platform: getPlatform(),
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
              defaultEmail: getSession()?.user.email,
              platform: getPlatform(),
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
        credentials: {
          password: pending.code,
          username: pending.loginUsed,
        },
        platform,
      });
    case AuthPendingRedirection.RENEW_PASSWORD:
      return StackActions.push(authRouteNames.changePassword, {
        credentials: {
          password: pending.code,
          username: pending.loginUsed,
        },
        platform,
        replaceAccountId: pending.accountId,
        replaceAccountTimestamp: pending.accountTimestamp,
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
    routes.push({ name: authRouteNames.accounts });
  } else if (appConf.hasMultiplePlatform) {
    routes.push({ name: authRouteNames.platforms });
  } // if single account && single platform, do not push any routes

  // 3 - Login Screen
  // 3.1 – Get actual platform object or name corresponding to the auth state + login if possible
  let foundPlatform: string | Platform | undefined = !appConf.hasMultiplePlatform ? allPlatforms[0] : undefined;
  let loginWithoutAccountId: string | undefined;
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
      } else {
        // This case is for failed activations & renews
        loginWithoutAccountId = pending.loginUsed;
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

  // 3.3 - Gather account data
  const accountObject = accountId ? accounts[accountId] : undefined;

  // 3.4 – Put the platform login route into the stack
  if (platform && (!multipleAccounts || (pending as AuthPendingRestore)?.account)) {
    const nextRoutes = getNavRoutesForLoginRedirection(platform, accountObject, loginWithoutAccountId);
    routes.push(...nextRoutes);
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
    return { index: routes.length - 1, routes, stale: true as const };
  }
};

export const getFirstTabRoute = () => ({
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
  stale: true as const,
});
