import { createStackNavigator } from "react-navigation-stack";

import HomeworkNavigator from "./cdt/navigator";
import PresencesNavigator from "./presences/navigator";
import Dashboard from "./viesco/containers/Dashboard";

export default createStackNavigator({
  Dashboard,
  cdt: {
    screen: HomeworkNavigator,
    navigationOptions: {
      header: null,
    },
  },
  presences: {
    screen: PresencesNavigator,
    navigationOptions: {
      header: null,
    },
  },
});
