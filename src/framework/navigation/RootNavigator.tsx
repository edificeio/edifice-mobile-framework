/**
 * Startup is a conditionnaly rendered content based on app startup status.
 * It can render the SplashScreen, auth flow or main flow in function of token loading and status.
 */
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { Platform, StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { useAppStartup } from '~/app/startup';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { RootToastHandler } from '~/framework/components/toast';
import { getAuthNavigationState } from '~/framework/modules/auth/navigation';
import useAuthNavigation from '~/framework/modules/auth/navigation/navigator';
import { IAuthState, getState as getAuthState } from '~/framework/modules/auth/reducer';
import { AppPushNotificationHandlerComponent } from '~/framework/util/notifications/cloudMessaging';
import { useNavigationTracker } from '~/framework/util/tracker/useNavigationTracker';

import { navigationRef } from './helper';
import modals from './modals/navigator';
import { getTypedRootStack } from './navigators';
import { StartupState, getState as getAppStartupState } from './redux';

function SplashScreenComponent() {
  React.useEffect(() => {
    return () => {
      SplashScreen.hide();
    };
  }, []);
  return null;
}

export interface RootNavigatorStoreProps {
  pending: IAuthState['pending'];
  accounts: IAuthState['accounts'];
  showOnboarding: IAuthState['showOnboarding'];
  appReady: StartupState['isReady'];
  dispatch: Dispatch;
}
export type RootNavigatorProps = RootNavigatorStoreProps;

const RootStack = getTypedRootStack();

function RootNavigator(props: RootNavigatorProps) {
  const { accounts, pending, showOnboarding, dispatch, appReady } = props;

  React.useEffect(() => {
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.palette.primary.regular);
  }, []);

  // App Startup

  useAppStartup(dispatch);

  // Get navigation state from redux state
  // Only if app is ready, and if the used is not logged in. (If logged, no navState goes to the timeline)

  const logged = false; // ToDo get from reducer
  const navigationState = React.useMemo(() => {
    return appReady && !logged ? getAuthNavigationState(accounts, pending, showOnboarding) : undefined;
  }, [accounts, appReady, logged, pending, showOnboarding]);

  // === Everytime computed navigationState changes, we need to update it in navigationRef by hand ===
  React.useLayoutEffect(() => {
    // useLayoutEffect is used to prevent to have a one-frame flash showing the old navigation state
    if (navigationState && navigationRef.isReady()) navigationRef.reset(navigationState);
  }, [navigationState]);

  // === Auth/Main switch ===
  // const mainNavigation = useMainNavigation(session?.apps ?? [], session?.widgets ?? []);
  const authNavigation = useAuthNavigation();
  const routes = React.useMemo(() => {
    return authNavigation;
  }, [authNavigation]);

  // const isFullyLogged = !!(logged && session); // Partial sessions scenarios have session = {...} && logged = false, and must stay on auth stack.

  // === Compute initial auth state ===
  // ToDo : verify that the state is correctly reset after logout & auto-login

  // const lastLoadedPlatform = useAppStartup(dispatch, session?.platform);
  // const initialNavState = React.useMemo(() => {
  //   return isReady && !logged ? getAuthNavigationState(lastLoadedPlatform, autoLoginResult) : undefined;
  // }, [isReady, logged, lastLoadedPlatform, autoLoginResult]);

  // No need to initialize navState when fully logged, because it will load the default MainStack behaviour (= Tabs view)

  // === Render navigation container with initialState ===

  const trackNavState = useNavigationTracker();

  const ret = React.useMemo(() => {
    return (
      <>
        <SplashScreenComponent key={appReady} />
        {appReady ? (
          <>
            <NavigationContainer ref={navigationRef} initialState={navigationState} onStateChange={trackNavState}>
              <AppPushNotificationHandlerComponent>
                <RootStack.Navigator screenOptions={{ headerShown: true }}>
                  {routes}
                  {modals}
                </RootStack.Navigator>
              </AppPushNotificationHandlerComponent>
              <RootToastHandler />
            </NavigationContainer>
          </>
        ) : null}
      </>
    );
  }, [appReady, navigationState, trackNavState, routes]);

  return ret;
}

export default connect((state: IGlobalState) => ({
  appReady: getAppStartupState(state).isReady,
  pending: getAuthState(state).pending,
  showOnboarding: getAuthState(state).showOnboarding,
  accounts: getAuthState(state).accounts,
}))(RootNavigator);
