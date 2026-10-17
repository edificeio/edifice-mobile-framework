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
} from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { BaseStackScreenLayout } from '~/app/navigation-new/layout';
import { visibleStackScreenOptions } from '~/app/navigation-new/options';
import { navigationLightTheme } from '~/app/navigation-new/theme';
import signInModule from '~/modules/auth/sign-in';
import { SignInContext, type SignInContextValue } from '~/modules/auth/sign-in/context';

export interface AuthNavigationWrapperProps extends SignInContextValue {
  /**
   * Navigation state of the sign-in screens: where the user starts from, and where to go when it changes
   * (see `useLoadAccountNavigationState` and `useAddAccountNavigationState`, to be called by the screen that renders this wrapper).
   * It must keep the same reference while the screens to show don't change.
   */
  navigationState: PartialState<NavigationState>;
  /**
   * Screens of the sign-in navigator, if some must differ from the ones of the sign-in module (same route names).
   * It must be a stable reference (the navigator is created once).
   */
  screens?: Record<keyof typeof signInModule.screens, unknown>;
  /**
   * Options for all the screens of the sign-in navigator, added to the default ones and overridden by the options of each screen.
   * It must be a stable reference (the navigator is created once).
   */
  screenOptions?: NativeStackNavigatorProps['screenOptions'];
}

export function AuthNavigationWrapper({
  navigationState,
  onSignedIn,
  screenOptions,
  screens = signInModule.screens,
}: AuthNavigationWrapperProps) {
  const { modals } = signInModule;

  const signInContext = React.useMemo(() => ({ onSignedIn }), [onSignedIn]);

  // Note: `useState` is used here only to prevent re-renders
  const [AuthNavigation] = React.useState(() =>
    createStaticNavigation(
      createNativeStackNavigator({
        groups: {
          Modals: { screens: modals },
          Screens: { screens: screens as typeof signInModule.screens },
        },
        screenLayout: BaseStackScreenLayout,
        screenOptions: props => ({
          ...visibleStackScreenOptions,
          ...(typeof screenOptions === 'function' ? screenOptions(props) : screenOptions),
        }),
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

  const onUnhandledAction = React.useCallback<NonNullable<React.ComponentProps<typeof AuthNavigation>['onUnhandledAction']>>(
    action => {
      navigation.dispatch(action);
    },
    [navigation],
  );

  // Note: `useState` is used here only to prevent re-renders
  const [tree] = React.useState(() => (
    <NavigationIndependentTree>
      <AuthNavigation
        theme={navigationLightTheme}
        ref={navigationRef}
        onUnhandledAction={onUnhandledAction}
        initialState={navigationState}
      />
    </NavigationIndependentTree>
  ));

  return <SignInContext.Provider value={signInContext}>{tree}</SignInContext.Provider>;
}
