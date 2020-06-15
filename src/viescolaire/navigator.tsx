import { createStackNavigator } from "react-navigation-stack";
import Dashboard from "./viesco/containers/Dashboard";
import HomeworkNavigator from "./cdt/navigator";

export default createStackNavigator ({
    Dashboard: {
      screen: Dashboard
    },
    cdt: HomeworkNavigator,
  },
  {
    headerMode: "none"
  }
);
