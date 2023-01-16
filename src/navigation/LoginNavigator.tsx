import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { redirectAfterChangePassword } from '~/user/actions/login';
import ActivationPage from '~/user/containers/ActivationPage';
import ChangePasswordPage from '~/user/containers/ChangePasswordPage';
import FederatedAccountPage from '~/user/containers/FederatedAccount';
import ForgotPage from '~/user/containers/ForgotPage';
import LoginPage from '~/user/containers/LoginPage';
import LoginWAYFPage from '~/user/containers/LoginWAYFPage';
import PlatformSelectPage from '~/user/containers/PlatformSelectPage';
import RevalidateTermsScreen from '~/user/containers/RevalidateTermsScreen';
import SendEmailVerificationCodeScreen from '~/user/containers/SendEmailVerificationCodeScreen';
import VerifyEmailCodeScreen from '~/user/containers/VerifyEmailCodeScreen';
import WAYFPage from '~/user/containers/WAYFPage';
import OnboardingScreen from '~/user/containers/onboarding';

import { loginRouteNames } from './helpers/loginRouteName';

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
    RevalidateTerms: {
      screen: RevalidateTermsScreen,
      navigationOptions: {
        gestureEnabled: false,
      },
    },
    SendEmailVerificationCode: {
      screen: SendEmailVerificationCodeScreen,
      navigationOptions: {
        gestureEnabled: false,
      },
    },
    VerifyEmailCode: {
      screen: VerifyEmailCodeScreen,
    },
  },
  {
    initialRouteName: 'Empty',
    headerMode: 'none',
  },
);
