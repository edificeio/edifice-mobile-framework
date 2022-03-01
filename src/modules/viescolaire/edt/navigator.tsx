import { createStackNavigator } from "react-navigation-stack";

import Timetable from "./containers/Timetable";

export default createStackNavigator(
  {
    Timetable,
  },
  {
    headerMode: "none",
  }
);
