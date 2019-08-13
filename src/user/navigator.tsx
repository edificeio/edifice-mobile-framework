import * as React from "react";
import I18n from "i18n-js";
import { createStackNavigator, NavigationState, NavigationContainer, NavigationContainerComponent, NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../navigation/helpers/navHelper";

import NotifPrefsPage, {
  NotifPrefsPageHeader, NotifPrefsPageNavigationOptions
} from "./containers/NotifPrefsPage";
import UserPage, { UserPageHeader, UserPageNavigationOptions } from "./containers/UserPage";
import ProfilePage, { ProfilePageNavigationOptions } from "./containers/ProfilePage";
import { Back } from "../ui/headers/Back";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Title } from "../ui/headers/Header";
import { HeaderBackAction } from "../ui/headers/NewHeader";

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
    navigationOptions: ProfilePageNavigationOptions,
    screen: ProfilePage
  }
});
