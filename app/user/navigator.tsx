import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

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
  }
});
