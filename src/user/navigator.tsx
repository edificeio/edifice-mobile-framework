import { createStackNavigator } from "react-navigation";

import NotifPrefsPage, {
  NotifPrefsPageNavigationOptions
} from "./containers/NotifPrefsPage";
import UserPage, { UserPageNavigationOptions } from "./containers/UserPage";
import ProfilePage from "./containers/ProfilePage";
import ChangePasswordPage from "./containers/ChangePasswordPage";

export default createStackNavigator({
  Profile: {
    navigationOptions: UserPageNavigationOptions,
    screen: UserPage
  },

  NotifPrefs: {
    navigationOptions: NotifPrefsPageNavigationOptions,
    screen: NotifPrefsPage
  },

  MyProfile: {
    screen: ProfilePage
  },

  ChangePassword: {
    screen: ChangePasswordPage
  }
});
