import { View } from "react-native";
import { NavigationContainer, StackNavigator } from "react-navigation";
import { tabNavigator, tabRootOptions } from "../utils/navHelper";

import I18n from "react-native-i18n";
import Login from "../auth/Login";

import AccountNavigation from "../auth/AccountNavigation";
import ConversationNavigator from "../conversation/ConversationNavigator";
import DiaryNavigator from "../diary/DiaryNavigator";
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

  diary: {
    screen: DiaryNavigator,

    navigationOptions: () => tabRootOptions(I18n.t("Diary"), "devoirs")
  },

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
    Login: { screen: Login },
    Main: { screen: MainNavigator }
  },
  {
    navigationOptions: { header: null }
  }
);
