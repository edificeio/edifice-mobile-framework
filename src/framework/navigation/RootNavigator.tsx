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

import { IGlobalState } from '~/AppStore';
import { useAppStartup } from '~/app/startup';
import theme from '~/app/theme';
import { ILoginResult } from '~/framework/modules/auth/actions';
import { ISession } from '~/framework/modules/auth/model';
import { getAuthNavigationState } from '~/framework/modules/auth/navigation';
import AuthNavigator from '~/framework/modules/auth/navigation/navigator';
import { getState as getAuthState, getSession } from '~/framework/modules/auth/reducer';

import { navigationRef } from './helper';
import { MainNavigation } from './mainNavigation';
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
  session?: ISession;
  logged: boolean;
  isReady: StartupState['isReady'];
  autoLoginResult?: ILoginResult;
  dispatch: Dispatch;
}
export type RootNavigatorProps = RootNavigatorStoreProps;

const RootStack = getTypedRootStack();

function RootNavigator(props: RootNavigatorProps) {
  const { logged, session, isReady, autoLoginResult, dispatch } = props;
  const isFullyLogged = logged && session; // Partial sessions scenarios have session = {...} && logged = false, and must stay on auth stack.

  React.useEffect(() => {
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.palette.primary.regular);
  }, []);

  // === Compute initial auth state ===
  // ToDo : verify that the state is correctly reset after logout & auto-login

  const lastLoadedPlatform = useAppStartup(dispatch, session?.platform);
  const initialNavState = React.useMemo(() => {
    return isReady && !logged ? getAuthNavigationState(lastLoadedPlatform, autoLoginResult) : undefined;
  }, [isReady, logged, lastLoadedPlatform, autoLoginResult]);

  // === If initialNavState changed during the runtime, we need to update it in navigationRef by hand ===
  React.useLayoutEffect(() => {
    // useLayoutEffect is used to prevent to have a one-frame flash showing the old navigation state
    if (initialNavState && navigationRef.isReady()) navigationRef.reset(initialNavState);
  }, [initialNavState]);

  // === Auth/Main switch ===
  const routes = React.useMemo(() => {
    return isFullyLogged ? MainNavigation(session.apps, session.widgets) : AuthNavigator();
  }, [isFullyLogged, session]);

  // No need to initialize navState when fully logged, because it will load the default MainStack behaviour (= Tabs view)

  // === Render navigation container with initialState ===

  const ret = React.useMemo(() => {
    return (
      <>
        <SplashScreenComponent key={isReady} />
        {isReady ? (
          <NavigationContainer ref={navigationRef} initialState={initialNavState}>
            <RootStack.Navigator screenOptions={{ headerShown: true }}>
              {routes}
              {modals}
            </RootStack.Navigator>
          </NavigationContainer>
        ) : null}
      </>
    );
  }, [isReady, initialNavState, routes]);

  return ret;
}

export default connect((state: IGlobalState) => ({
  session: getSession(state),
  logged: getAuthState(state).logged,
  isReady: getAppStartupState(state).isReady,
  autoLoginResult: getAuthState(state).autoLoginResult,
}))(RootNavigator);
