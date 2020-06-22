import { createStackNavigator } from "react-navigation-stack";

import HomeworkNavigator from "./cdt/navigator";
import PresencesNavigator from "./presences/navigator";
import Dashboard from "./viesco/containers/Dashboard";

export default createStackNavigator({
  Dashboard: Dashboard,
  cdt: HomeworkNavigator,
  presences: PresencesNavigator,
});
