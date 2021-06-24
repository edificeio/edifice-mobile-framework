import { createStackNavigator } from "react-navigation-stack";

import LoginPage from "../user/containers/LoginPage";
import ActivationPage from "../user/containers/ActivationPage";
import ForgotPage from "../user/containers/ForgotPage";
import OnboardingScreen from "../user/containers/OnboardingScreen";
import PlatformSelectPage from "../user/containers/PlatformSelectPage";
import FederatedAccountPage from "../user/containers/FederatedAccount";

import Conf from "../../ode-framework-conf";

/**
 * # Login Navigator
 *
 * This stack navigator handles all login process.
 * Before, these screens were included in the RootNavigator (an intance of switchNavigator).
 * The stack navigator has the benefit of allowing the user to go back easily with native gestures and screen animation.
 */

export default createStackNavigator({
  Onboarding: { screen: OnboardingScreen},
  PlatformSelect: { screen: OnboardingScreen },
  // PlatformSelect: { screen: PlatformSelectPage },
  LoginHome: { screen: LoginPage },
  LoginActivation: { screen: ActivationPage },
  Forgot: { screen: ForgotPage },
  FederatedAccount: { screen: FederatedAccountPage }
}, {
    initialRouteName: Conf.platforms && Object.keys(Conf.platforms).length > 1 ? 'PlatformSelect' : 'LoginHome',
    headerMode: 'none',
  });
