import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationActions, NavigationNavigateAction } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';



import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import appConf from '~/framework/util/appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { redirectAfterChangePassword } from '~/user/actions/login';
import ActivationPage from '~/user/containers/ActivationPage';
import ChangePasswordPage from '~/user/containers/ChangePasswordPage';
import FederatedAccountPage from '~/user/containers/FederatedAccount';
import ForgotPage from '~/user/containers/ForgotPage';
import LoginPage from '~/user/containers/LoginPage';
import LoginWAYFPage from '~/user/containers/LoginWAYFPage';
import OnboardingScreen from '~/user/containers/OnboardingScreen';
import PlatformSelectPage from '~/user/containers/PlatformSelectPage';
import WAYFPage from '~/user/containers/WAYFPage';



import { getLoginRouteName, loginRouteNames } from './helpers/loginRouteName';


/**
 * # Login Navigator
 *
 * This stack navigator handles all login process.
 * Before, these screens were included in the RootNavigator (an intance of switchNavigator).
 * The stack navigator has the benefit of allowing the user to go back easily with native gestures and screen animation.
 */

export default createStackNavigator(
  {
    Empty: { screen: () => <View /> },
    FederatedAccount: { screen: FederatedAccountPage },
    Forgot: { screen: ForgotPage },
    [loginRouteNames.default]: { screen: LoginPage },
    LoginActivation: { screen: ActivationPage },
    [loginRouteNames.wayf]: { screen: LoginWAYFPage },
    Onboarding: { screen: OnboardingScreen },
    PlatformSelect: { screen: PlatformSelectPage },
    WAYF: { screen: WAYFPage },
    ChangePassword: {
      screen: withViewTracking('auth/ChangePassword')(ChangePasswordPage),
      params: {
        redirectCallback: redirectAfterChangePassword,
        forceChange: true,
        isLoginNavigator: true,
      },
    },
  },
  {
    initialRouteName: 'Empty',
    headerMode: 'none',
  },
);