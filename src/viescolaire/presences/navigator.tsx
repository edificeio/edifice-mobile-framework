import { createStackNavigator } from "react-navigation-stack";

import DeclareEvent from "./components/DeclareEvent";
import History from "./containers/History";
import TeacherCallSheet from "./containers/TeacherCallSheet";

export default createStackNavigator(
  {
    CallSheetPage: TeacherCallSheet,
    DeclareEvent,
    History,
  },
  {
    headerMode: "screen",
  }
);
