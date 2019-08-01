import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navScreenOptions } from "../navigation/helpers/navHelper";

import NotifPrefsPage, {
  NotifPrefsPageHeader
} from "./containers/NotifPrefsPage";
import UserPage, { UserPageHeader } from "./containers/UserPage";
import ProfilePage, { ProfilePageHeader } from "./containers/ProfilePage";

export default createStackNavigator({
  Profile: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <UserPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: UserPage
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
  },

  MyProfile: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <ProfilePageHeader navigation={navigation} isEditMode={navigation.getParam("edit", false)} />,
        },
        navigation
      ),
    screen: ProfilePage
  }
});
