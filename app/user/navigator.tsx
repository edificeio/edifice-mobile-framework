import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navScreenOptions } from "../navigation/helpers/navHelper";

import NotifPrefsPage, {
  NotifPrefsPageHeader
} from "./containers/NotifPrefsPage";
import ProfilePage, { ProfilePageHeader } from "./containers/ProfilePage";

export default createStackNavigator({
  Profile: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <ProfilePageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: ProfilePage
  },

  NotifPrefs: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <NotifPrefsPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: NotifPrefsPage
  }
});
