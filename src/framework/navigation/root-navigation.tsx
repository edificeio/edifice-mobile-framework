/**
 * Startup is a conditionnaly rendered content based on app startup status.
 * It can render the SplashScreen, auth flow or main flow in function of token loading and status.
 */
import * as React from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { connect, useSelector } from 'react-redux';

import { navigationRef } from './helper';
import modals from './modals/navigator';
import { navBarOptions } from './navBar';
import { getTypedRootStack } from './navigators';
import { TabNavigation } from './tab-navigation';

import { useAvailableModules } from '~/app/modules';
import { IGlobalState } from '~/app/store';
import { RootToastContainer } from '~/framework/components/toast';
import useAuthNavigation from '~/framework/modules/auth/navigation/main-account/navigator';
import { getAuthNavigationState, getFirstTabRoute } from '~/framework/modules/auth/navigation/main-account/router';
import { getState as getAuthState, IAuthState, selectors } from '~/framework/modules/auth/reducer';
import { AppPushNotificationHandlerComponent } from '~/framework/util/notifications/cloudMessaging';
import { useNavigationTracker } from '~/framework/util/tracker/useNavigationTracker';

// Note: import tabModules register to initialize it
import './tabModules';

export interface RootNavigatorStoreProps {
  pending: IAuthState['pending'];
  accounts: IAuthState['accounts'];
  showOnboarding: IAuthState['showOnboarding'];
  connected: IAuthState['connected'];
  requirement: IAuthState['requirement'];
  lastAddAccount: IAuthState['lastAddAccount'];
  lastDeletedAccount: IAuthState['lastDeletedAccount'];
}
export type RootNavigatorProps = RootNavigatorStoreProps;

const RootStack = getTypedRootStack();

const tabOptions = { headerShown: false };

export function MainNavigation() {
  return (
    <>
      <RootStack.Screen name="$tabs" component={TabNavigation} options={tabOptions} />
      {modals}
    </>
  );
}

export function GuestNavigation() {
  return (
    <>
      {useAuthNavigation()}
      {modals}
    </>
  );
}

export const RootNavigator = connect((state: IGlobalState) => {
  return {
    accounts: getAuthState(state).accounts,
    connected: getAuthState(state).connected,
    lastAddAccount: getAuthState(state).lastAddAccount,
    lastDeletedAccount: getAuthState(state).lastDeletedAccount,
    pending: getAuthState(state).pending,
    requirement: getAuthState(state).requirement,
    showOnboarding: getAuthState(state).showOnboarding,
  };
})(function RootNavigator({ accounts, lastDeletedAccount, pending, showOnboarding }: RootNavigatorProps) {
  const session = useSelector(selectors.session);
  const requirement = useSelector(selectors.requirement);
  const showAppContent = session && !requirement;

  const navigationState = React.useMemo(
    () =>
      showAppContent
        ? getFirstTabRoute()
        : getAuthNavigationState(accounts, pending, showOnboarding, requirement, lastDeletedAccount),
    [accounts, lastDeletedAccount, pending, requirement, showAppContent, showOnboarding],
  );
  const navigationStateSerialized = JSON.stringify(navigationState);

  const trackNavigationChange = useNavigationTracker();

  // Everytime computed navigationState changes, we need to update it in navigationRef by hand ===
  React.useLayoutEffect(() => {
    // useLayoutEffect is used to prevent to have a one-frame flash showing the old navigation state
    if (navigationState && navigationRef.isReady()) {
      console.debug('[Navigation] Reset navigation state');
      navigationRef.resetRoot(navigationState);
    }
    trackNavigationChange(navigationState); // ToDo: runAfterInteractions
    // Note: `navigationState` can be recreated with same value. We WANT retrigger this layoutEffect only when new `navigationState` has a different value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationStateSerialized, trackNavigationChange]);

  useAvailableModules(session);

  return (
    <NavigationContainer ref={navigationRef} initialState={navigationState} onStateChange={trackNavigationChange}>
      <BottomSheetModalProvider>
        <AppPushNotificationHandlerComponent>
          <RootStack.Navigator screenOptions={navBarOptions}>
            {showAppContent ? MainNavigation() : GuestNavigation()}
          </RootStack.Navigator>
        </AppPushNotificationHandlerComponent>
      </BottomSheetModalProvider>
      <RootToastContainer />
    </NavigationContainer>
  );
});
