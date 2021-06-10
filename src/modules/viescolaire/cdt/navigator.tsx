import { createStackNavigator } from "react-navigation-stack";

import Homework from "./containers/Homework";
import HomeworkList from "./containers/HomeworkList";
import Session from "./containers/Session";

export default createStackNavigator(
  {
    HomeworkList,
    HomeworkPage: Homework,
    SessionPage: Session,
  },
  {
    headerMode: "screen",
  }
);
