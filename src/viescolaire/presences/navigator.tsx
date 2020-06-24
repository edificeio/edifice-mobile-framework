import { createStackNavigator } from "react-navigation-stack";

import History from "./containers/History";
import TeacherCallSheet from "./containers/TeacherCallSheet";

export default createStackNavigator(
  {
    History: {
      screen: History,
    },
    CallSheetPage: TeacherCallSheet,
  },
  {
    headerMode: "screen",
  }
);
