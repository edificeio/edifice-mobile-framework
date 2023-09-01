/**
 * Startup is a conditionnaly rendered content based on app startup status.
 * It can render the SplashScreen, auth flow or main flow in function of token loading and status.
 */
import { Header } from '@react-navigation/elements';
import * as React from 'react';
import { Platform, ScrollView, StatusBar, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ILoginResult } from '~/framework/modules/auth/actions';
import { ISession } from '~/framework/modules/auth/model';
import { getState as getAuthState, getSession } from '~/framework/modules/auth/reducer';
import PFMonLycee from '~/platforms/idf';

import { UI_SIZES } from '../components/constants';
import { PageViewStyle } from '../components/page';
import { PFLogo } from '../components/pfLogo';
import { BodyText, TextFontStyle } from '../components/text';
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
  React.useEffect(() => {
    if (Platform.OS === 'android') StatusBar.setBackgroundColor(theme.palette.primary.regular);
    StatusBar.setBarStyle('light-content');
    SplashScreen.hide();
  }, []);

  // === Compute initial auth state ===
  // ToDo : verify that the state is correctly reset after logout & auto-login

  // const lastLoadedPlatform = useAppStartup(dispatch, session?.platform);
  // const initialNavState = React.useMemo(() => {
  //   return isReady && !logged ? getAuthNavigationState(lastLoadedPlatform, autoLoginResult) : undefined;
  // }, [isReady, logged, lastLoadedPlatform, autoLoginResult]);

  // === If initialNavState changed during the runtime, we need to update it in navigationRef by hand ===
  // React.useLayoutEffect(() => {
  //   // useLayoutEffect is used to prevent to have a one-frame flash showing the old navigation state
  //   if (initialNavState && navigationRef.isReady()) navigationRef.reset(initialNavState);
  // }, [initialNavState]);

  // === Auth/Main switch ===
  // const mainNavigation = useMainNavigation(session?.apps ?? [], session?.widgets ?? []);
  // const authNavigation = useAuthNavigation();
  // const routes = React.useMemo(() => {
  //   return isFullyLogged ? mainNavigation : authNavigation;
  // }, [authNavigation, isFullyLogged, mainNavigation]);

  // No need to initialize navState when fully logged, because it will load the default MainStack behaviour (= Tabs view)

  // === Render navigation container with initialState ===

  // const trackNavState = useNavigationTracker();

  const ret = React.useMemo(() => {
    return (
      <>
        <Header
          {...{
            title: 'MonLycée.net',
            headerStyle: {
              backgroundColor: theme.palette.primary.regular,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: {
              ...TextFontStyle.Bold,
              color: theme.ui.text.inverse,
            },
            headerTintColor: theme.ui.text.inverse.toString(),
            headerBackVisible: false,
            headerShadowVisible: true,
            headerBackButtonMenuEnabled: false,
            freezeOnBlur: true,
          }}
        />
        <ScrollView
          alwaysBounceVertical={false}
          style={{
            backgroundColor: theme.ui.background.page,
          }}
          contentContainerStyle={{
            flex: 1,
          }}>
          <PageViewStyle
            style={{
              alignItems: 'center',
              paddingVertical: UI_SIZES.spacing.huge,
              paddingHorizontal: UI_SIZES.spacing.big,
              flex: 1,
              justifyContent: 'space-evenly',
            }}>
            <View style={{ flex: 1, justifyContent: 'center', transform: 'scale(1.333)' }}>
              <PFLogo pf={PFMonLycee.prod} />
            </View>
            <BodyText style={{ marginVertical: UI_SIZES.spacing.huge, textAlign: 'center', flex: 2 }}>
              L'application mobile Monlycee.net n'est plus disponible depuis le 01/09/2023 et sera remplacée par un autre service.
              Nous vous invitons à vous connecter sur votre plateforme web monlycee.net.
            </BodyText>
          </PageViewStyle>
        </ScrollView>
      </>
    );
  }, []);

  return ret;
}

export default connect((state: IGlobalState) => ({
  session: getSession(),
  logged: getAuthState(state).logged,
  isReady: getAppStartupState(state).isReady,
  autoLoginResult: getAuthState(state).autoLoginResult,
}))(RootNavigator);
