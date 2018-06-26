import { View } from "react-native";
import { NavigationContainer, StackNavigator } from "react-navigation";
import { tabNavigator, tabRootOptions } from "../utils/navHelper";

import I18n from "react-native-i18n";
import Login from "../auth/Login";

import AccountNavigation from "../auth/AccountNavigation";
import ConversationNavigator from "../conversation/ConversationNavigator";
import HomeworkNavigator from "../homework/HomeworkNavigator";
import TimelineNavigator from "../timeline/TimelineNavigator";
import UiNavigator from "../ui/showcase/UiNavigator";

const MainNavigator = tabNavigator({
  timeline: {
    screen: TimelineNavigator,

    navigationOptions: () => tabRootOptions(I18n.t("News"), "nouveautes")
  },

  conversation: {
    screen: ConversationNavigator,

    navigationOptions: () =>
      tabRootOptions(I18n.t("Conversation"), "conversation")
  },

  profile: {
    screen: AccountNavigation,

    navigationOptions: () => tabRootOptions(I18n.t("Profile"), "profile")
  },

  homework: {
    screen: HomeworkNavigator,

    navigationOptions: () => tabRootOptions(I18n.t("Homework"), "profile")
  },

  ui: {
    screen: UiNavigator,

    navigationOptions: () => tabRootOptions("UI", "profile")
  }
});

export const AppNavigator: NavigationContainer = StackNavigator(
  {
    Bootstrap: { screen: View },
    Login: { screen: Login },
    Main: { screen: MainNavigator }
  },
  {
    navigationOptions: { header: null }
  }
);
