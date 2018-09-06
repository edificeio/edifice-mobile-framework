import { View } from "react-native";
import { NavigationContainer, StackNavigator } from "react-navigation";
import { tabNavigator, tabRootOptions } from "../utils/navHelper";

import I18n from "react-native-i18n";
import LoginPage from "../user/containers/LoginPage";

import AccountNavigation from "../auth/AccountNavigation";
import ConversationNavigator from "../conversation/ConversationNavigator";
import TimelineNavigator from "../timeline/TimelineNavigator";

import moduleDefinitions from "../AppModules";
import { getRoutesFromModuleDefinitions } from "../infra/moduleTool";

const MainNavigator = tabNavigator({
  // TODO put the routes on moduleDefinitions
  timeline: {
    screen: TimelineNavigator,

    navigationOptions: () => tabRootOptions(I18n.t("News"), "nouveautes")
  },

  conversation: {
    screen: ConversationNavigator,

    navigationOptions: () =>
      tabRootOptions(I18n.t("Conversation"), "conversation")
  },

  ...getRoutesFromModuleDefinitions(moduleDefinitions),

  profile: {
    screen: AccountNavigation,

    navigationOptions: () => tabRootOptions(I18n.t("Profile"), "profile")
  } /*,

  ui: {
    screen: UiNavigator,

    navigationOptions: () => tabRootOptions("UI", "profile")
  }*/
});

export const AppNavigator: NavigationContainer = StackNavigator(
  {
    Bootstrap: { screen: View },
    Login: { screen: LoginPage },
    Main: { screen: MainNavigator }
  },
  {
    navigationOptions: { header: null }
  }
);
