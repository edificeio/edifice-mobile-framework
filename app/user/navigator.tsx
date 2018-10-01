import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

import NotifPrefsPage, {
  NotifPrefsPageHeader
} from "./containers/NotifPrefsPage";
import ProfilePage, { ProfilePageHeader } from "./containers/ProfilePage";

export default StackNavigator({
  Profile: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <ProfilePageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ProfilePage
  },

  NotifPrefs: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <NotifPrefsPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: NotifPrefsPage
  }
});
