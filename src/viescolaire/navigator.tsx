import { createStackNavigator } from "react-navigation-stack";
import Dashboard from "./viesco/containers/Dashboard";

export default createStackNavigator(
  {
    Dashboard,
  },
  {
    initialRouteKey: "Dashboard",
  }
);
