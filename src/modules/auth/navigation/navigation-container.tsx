/**
 * Navigation Container form ath screens
 * Auth screens (load/add account) contains an independant navigation container tied to the auth store.
 */

import React from 'react';

import {
  createStaticNavigation,
  NavigationIndependentTree,
  useNavigation,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { navigationLightTheme } from '~/app/navigation-new/theme';

import signInModule from '../signIn';

export function AuthNavigationWrapper() {
  const { modals, screens } = signInModule;

  const navigationState = React.useMemo(() => ({ routes: [{ name: 'signIn/welcome' }] }), []);

  // Note: `useState` is used here only to prevent re-renders
  const [AuthNavigation] = React.useState(() =>
    createStaticNavigation(
      createNativeStackNavigator({
        groups: {
          Modals: { screens: modals },
          Screens: { screens },
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

  return tree;
}
