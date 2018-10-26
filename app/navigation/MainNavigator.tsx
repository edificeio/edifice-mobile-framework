import I18n from "react-native-i18n";

// import ConversationNavigator from "../conversation/ConversationNavigator";
import TimelineNavigator from "../timeline/TimelineNavigator";

import moduleDefinitions from "../AppModules";
import { getRoutesFromModuleDefinitions } from "../infra/moduleTool";
import {
  createMainTabNavigator,
  createMainTabNavOption
} from "./helpers/mainTabNavigator";

export const MainNavigator = createMainTabNavigator({
  // TODO put the routes of timeline & conversation in moduleDefinitions
  timeline: {
    screen: TimelineNavigator,

    navigationOptions: () =>
      createMainTabNavOption(I18n.t("News"), "nouveautes")
  },

  /* conversation: {
    screen: ConversationNavigator,

    navigationOptions: () =>
      createMainTabNavOption(I18n.t("Conversation"), "conversation")
  }, */

  ...getRoutesFromModuleDefinitions(moduleDefinitions)
});
