import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

import { View } from "react-native";

export default StackNavigator({
  Profile: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <View />
        },
        navigation
      ),
    screen: View
  }
});
