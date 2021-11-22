import * as React from "react";
import { View } from "react-native";
import I18n from "i18n-js";
import { createStackNavigator } from "react-navigation-stack";

import ActivationPage from "../user/containers/ActivationPage";
import FederatedAccountPage from "../user/containers/FederatedAccount";
import ForgotPage from "../user/containers/ForgotPage";
import LoginPage from "../user/containers/LoginPage";
import OnboardingScreen from "../user/containers/OnboardingScreen";
import PlatformSelectPage from "../user/containers/PlatformSelectPage";

import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import appConf from "~/framework/util/appConf";

/**
 * # Login Navigator
 *
 * This stack navigator handles all login process.
 * Before, these screens were included in the RootNavigator (an intance of switchNavigator).
 * The stack navigator has the benefit of allowing the user to go back easily with native gestures and screen animation.
 */

export const getLoginStackToDisplay = (selectedPlatform: string | null, forceOnboarding: boolean = false) => {
  const ret = [] as NavigationNavigateAction[];
  const onboardingTexts = I18n.t("user.onboardingScreen.onboarding");
  const hasOnboardingTexts = onboardingTexts && onboardingTexts.length;
  const hasMultiplePlatforms = appConf.platforms.length > 1;
  if (hasOnboardingTexts) ret.push(NavigationActions.navigate({ routeName: 'Onboarding' }))
  if (hasMultiplePlatforms && (selectedPlatform || !ret.length)) ret.push(NavigationActions.navigate({ routeName: 'PlatformSelect' }));
  if (!forceOnboarding && (selectedPlatform || !ret.length)) ret.push(NavigationActions.navigate({ routeName: 'LoginHome' }));
  return ret;
}

export default createStackNavigator({
  Empty: { screen: () => <View /> },
  Onboarding: { screen: OnboardingScreen },
  PlatformSelect: { screen: PlatformSelectPage },
  LoginHome: { screen: LoginPage },
  LoginActivation: { screen: ActivationPage },
  Forgot: { screen: ForgotPage },
  FederatedAccount: { screen: FederatedAccountPage }
}, {
    initialRouteName: 'Empty',
    headerMode: 'none',
  });
