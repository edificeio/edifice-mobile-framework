import * as React from "react";
import { StackNavigator } from "react-navigation";

import NotificationsSettings, {
  NotificationsSettingsHeader
} from "./containers/NotificationsSettings";
import UserProfile, { UserProfileHeader } from "./containers/UserProfile";

export default StackNavigator({
  userProfile: {
    navigationOptions: ({ navigation }) => ({
      header: <UserProfileHeader navigation={navigation} />
    }),
    screen: UserProfile
  },

  notificationsSettings: {
    navigationOptions: ({ navigation }) => ({
      header: <NotificationsSettingsHeader navigation={navigation} />,
      tabBarVisible: false
    }),
    screen: NotificationsSettings
  }
});
