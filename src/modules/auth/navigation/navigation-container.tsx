/**
 * Navigation Container form ath screens
 * Auth screens (load/add account) contains an independant navigation container tied to the auth stores.
 * `onSignedIn` is called with the result of any successful sign-in of its screens: the holder decides what to do with it.
 */

import React from 'react';

import {
  createStaticNavigation,
  NavigationIndependentTree,
  useNavigation,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { visibleStackScreenOptions } from '~/app/navigation-new/options';
import { navigationLightTheme } from '~/app/navigation-new/theme';

import signInModule from '../sign-in';
import { SignInContext, type SignInContextValue } from '../sign-in/context';
import { useSignInNavigationState } from '../sign-in/navigation';

export function AuthNavigationWrapper({ onSignedIn }: SignInContextValue) {
  const { modals, screens } = signInModule;

  const navigationState = useSignInNavigationState();
  const signInContext = React.useMemo(() => ({ onSignedIn }), [onSignedIn]);

  // Note: `useState` is used here only to prevent re-renders
  const [AuthNavigation] = React.useState(() =>
    createStaticNavigation(
      createNativeStackNavigator({
        groups: {
          Modals: { screens: modals },
          Screens: { screens },
        },
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
