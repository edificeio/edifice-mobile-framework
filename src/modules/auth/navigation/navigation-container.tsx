/**
 * Navigation Container form ath screens
 * Auth screens (load/add account) contains an independant navigation container tied to the auth stores.
 * `onSignedIn` is called with the result of any successful sign-in of its screens: the holder decides what to do with it.
 */

import React from 'react';

import {
  createStaticNavigation,
  NavigationIndependentTree,
  type NavigationState,
  type PartialState,
  useNavigation,
  useNavigationContainerRef,
  useRoute,
} from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { useTelemetryDelegatedRoutes } from '~/app/module/hooks';
import { BaseStackScreenLayout } from '~/app/navigation-new/layout';
import { visibleStackScreenOptions } from '~/app/navigation-new/options';
import { useScreenTelemetry } from '~/app/navigation-new/telemetry';
import { navigationLightTheme } from '~/app/navigation-new/theme';
import AuthAccountsScreen from '~/modules/auth/screens/accounts';
import signInModule from '~/modules/auth/sign-in';
import { SignInContext, type SignInContextValue } from '~/modules/auth/sign-in/context';

export interface AuthNavigationWrapperProps extends SignInContextValue {
  /**
   * Navigation state of the sign-in screens: where the user starts from, and where to go when it changes
   * (see `screens/load-account.tsx` and `screens/add-account.tsx`, which compute it).
   * It must keep the same reference while the screens to show don't change.
   */
  navigationState: PartialState<NavigationState>;
  /**
   * Screens replacing the ones of the sign-in module (same route name), for the screens that are not the same where the navigator
   * is used. The accounts selector is always there (`auth/accounts`), even where nothing leads to it.
   * It must be a stable reference (the navigator is created once).
   */
  screens?: Record<string, unknown>;
  /**
   * Options for all the screens of the sign-in navigator, added to the default ones and overridden by the options of each screen.
   * It must be a stable reference (the navigator is created once).
   */
  screenOptions?: NativeStackNavigatorProps['screenOptions'];
}

/** The accounts selector is a screen of this navigator only (not of the module): the sign-in module doesn't know the accounts. */
const accountsScreen = { 'auth/accounts': AuthAccountsScreen };

export function AuthNavigationWrapper({ navigationState, onSignedIn, screenOptions, screens }: AuthNavigationWrapperProps) {
  const { modals } = signInModule;

  const signInContext = React.useMemo(() => ({ onSignedIn }), [onSignedIn]);

  // Note: `useState` is used here only to prevent re-renders
  const [AuthNavigation] = React.useState(() =>
    createStaticNavigation(
      createNativeStackNavigator({
        groups: {
          Modals: { screens: modals },
          Screens: {
            // Cast: the static types of the sign-in screens don't allow routes of its own besides them (the accounts selector, replacements)
            screens: { ...signInModule.screens, ...accountsScreen, ...screens } as typeof signInModule.screens,
          },
        },
        screenLayout: BaseStackScreenLayout,
        screenOptions: props => {
          return {
            ...(typeof visibleStackScreenOptions === 'function' ? visibleStackScreenOptions(props) : visibleStackScreenOptions),
            ...(typeof screenOptions === 'function' ? screenOptions(props) : screenOptions),
          };
        },
      }),
    ),
  );

  const navigation = useNavigation();
  const navigationRef = useNavigationContainerRef();
  const initialNavigationDone = React.useRef(false);
  React.useEffect(() => {
    initialNavigationDone.current && navigationRef.isReady() && navigationState && navigationRef.reset(navigationState);
    initialNavigationDone.current = true;
  }, [navigationRef, navigationState]);

  // The screen that hosts this navigator is not tracked by the app (`delegatesTelemetry`): it is tracked here, before the first screen.
  const { name: hostRouteName } = useRoute();
  const delegatedRoutes = useTelemetryDelegatedRoutes();
  const { logNavigationState, logRoute, onScreenChange } = useScreenTelemetry();

  const onUnhandledAction = React.useCallback<NonNullable<React.ComponentProps<typeof AuthNavigation>['onUnhandledAction']>>(
    action => {
      navigation.dispatch(action);
    },
    [navigation],
  );

  const onReady = React.useCallback<NonNullable<React.ComponentProps<typeof AuthNavigation>['onReady']>>(() => {
    // Only if the app leaves it to this navigator, else it tracks it itself (and twice, in the wrong order, if it was done here too)
    if (delegatedRoutes.has(hostRouteName)) logRoute(hostRouteName);
    else
      __DEV__ &&
        console.warn(`[Navigation] "${hostRouteName}" hosts the sign-in navigator: it should declare \`delegatesTelemetry\`.`);
    logNavigationState(navigationState);
  }, [delegatedRoutes, hostRouteName, navigationState, logNavigationState, logRoute]);

  // Note: `useState` is used here only to prevent re-renders
  const [tree] = React.useState(() => (
    <NavigationIndependentTree>
      <AuthNavigation
        theme={navigationLightTheme}
        ref={navigationRef}
        onUnhandledAction={onUnhandledAction}
        initialState={navigationState}
        onStateChange={onScreenChange}
        onReady={onReady}
      />
    </NavigationIndependentTree>
  ));

  return <SignInContext.Provider value={signInContext}>{tree}</SignInContext.Provider>;
}
