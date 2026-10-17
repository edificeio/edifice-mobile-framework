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
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
}

export function AuthNavigationWrapper({ navigationState, onSignedIn }: AuthNavigationWrapperProps) {
  const { modals, screens } = signInModule;

  const signInContext = React.useMemo(() => ({ onSignedIn }), [onSignedIn]);

  // Note: `useState` is used here only to prevent re-renders
  const [AuthNavigation] = React.useState(() =>
    createStaticNavigation(
      createNativeStackNavigator({
        groups: {
          Modals: { screens: modals },
          Screens: { screens },
        },
        screenLayout: BaseStackScreenLayout,
        screenOptions: visibleStackScreenOptions,
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
