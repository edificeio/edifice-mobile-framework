import { createStackNavigator } from "react-navigation-stack";

import History from "./containers/History";

export default createStackNavigator(
  {
    History: {
      screen: History,
    },
  },
  {
    headerMode: "screen",
  }
);
