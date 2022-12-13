/**
 * Startup is a conditionnaly rendered content based on app startup status.
 * It can render the SplashScreen, auth flow or main flow in function of token loading and status.
 */
import { NavigationContainer, ParamListBase, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Text } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { IGlobalState } from '~/AppStore';
import { useAppStartup } from '~/app/startup';
import AuthNavigator, { getAuthNavigationState } from '~/framework/modules/auth/navigator';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';

import { ILoginResult } from '../modules/auth/actions';
import { ISession } from '../modules/auth/model';
import { BackdropPdfReaderScreen } from '../screens/PdfReaderScreen';
import { getActiveSession } from '../util/session';
import { StartupState, getState as getAppStartupState } from './redux';

export const navigationRef = createNavigationContainerRef();

function SplashScreenComponent() {
  React.useEffect(() => {
    return () => {
      SplashScreen.hide();
    };
  }, []);
  return null;
}

export enum RootRouteNames {
  MainStack = '$main',
  AuthStack = '$auth',
  Pdf = '$pdf',
}
export interface IRootNavigationParams extends ParamListBase {
  [RootRouteNames.Pdf]: { title: string; src: string };
}

export interface RootNavigatorStoreProps {
  session?: ISession;
  logged: boolean;
  isReady: StartupState['isReady'];
  autoLoginResult?: ILoginResult;
  dispatch: Dispatch;
}
export type RootNavigatorProps = RootNavigatorStoreProps;

const Stack = createNativeStackNavigator<IRootNavigationParams>();

function RootNavigatorUnconnected(props: RootNavigatorProps) {
  const { logged, session, isReady, autoLoginResult, dispatch } = props;
  const isFullyLogged = logged && session; // Partial sessions scenarios have session = true && logged = false, and must stay on auth stack.

  // === Compute initial auth state ===
  // ToDo : verify that the state is correctly reset after logout & auto-login

  const loadedPlatform = useAppStartup(dispatch);
  const initialNavState = React.useMemo(() => {
    const authNavState = getAuthNavigationState(loadedPlatform, autoLoginResult);
    return isReady && !logged
      ? {
          routes: [
            {
              name: RootRouteNames.AuthStack,
              state: authNavState,
            },
          ],
        }
      : undefined;
  }, [isReady, logged, loadedPlatform, autoLoginResult]);

  // No need to initialize navState when fully logged, because it will load the default MainStack behaviour (= Tabs view)

  // === Render navigation container with initialState ===

  return (
    <>
      <SplashScreenComponent key={isReady} />
      <NavigationContainer ref={navigationRef} initialState={initialNavState}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* === A. Auth/Main switch === */}
          {isFullyLogged ? (
            <Stack.Screen
              name={RootRouteNames.MainStack}
              options={{ animation: 'none' }}
              component={() => <Text>{`\n\n\nMAIN STACK`}</Text>}
            />
          ) : (
            <Stack.Screen name={RootRouteNames.AuthStack} options={{ animation: 'none' }} component={AuthNavigator} />
          )}

          {/* === B. Global modals === */}
          <Stack.Screen
            name={RootRouteNames.Pdf}
            options={screenProps => ({ presentation: 'formSheet', headerShown: true, title: screenProps.route.params.title })}
            component={BackdropPdfReaderScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default connect((state: IGlobalState) => ({
  session: getActiveSession(),
  logged: getAuthState(state).logged,
  isReady: getAppStartupState(state).isReady,
  autoLoginResult: getAuthState(state).autoLoginResult,
}))(RootNavigatorUnconnected);
