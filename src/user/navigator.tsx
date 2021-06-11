import { createStackNavigator } from "react-navigation-stack";

import {
  NotifPrefsPageNavigationOptions
} from "./containers/NotifPrefsPage";
import UserPage, { UserPageNavigationOptions } from "./containers/UserPage";
import ProfilePage from "./containers/ProfilePage";
import ChangePasswordPage from "./containers/ChangePasswordPage";
import StructuresPage from "./containers/StructuresPage";
import RelativesPage from "./containers/RelativesPage";
import ChildrenPage from "./containers/ChildrenPage";
import PushNotifsSettingsScreen from "./containers/PushNotifsSettingsScreen";
import LegalNoticeScreen from "./containers/LegalNoticeScreen";

export default createStackNavigator({
  Profile: {
    navigationOptions: UserPageNavigationOptions,
    screen: UserPage
  },

  NotifPrefs: {
    navigationOptions: NotifPrefsPageNavigationOptions,
    screen: PushNotifsSettingsScreen
  },

  LegalNotice: {
    navigationOptions: {
      header: null,
    },
    screen: LegalNoticeScreen
  },

  MyProfile: {
    screen: ProfilePage
  },

  ChangePassword: {
    screen: ChangePasswordPage
  },

  Structures: {
    screen: StructuresPage
  },

  Relatives: {
    screen: RelativesPage
  },

  Children: {
    screen: ChildrenPage
  }
});
