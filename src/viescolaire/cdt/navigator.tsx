import { createStackNavigator } from "react-navigation-stack";

import Homework from "./containers/Homework";
import HomeworkList from "./containers/HomeworkList";
import Session from "./containers/Session";

export default createStackNavigator(
  {
    HomeworkList: {
      screen: HomeworkList,
    },
    HomeworkPage: {
      screen: Homework,
    },
    SessionPage: {
      screen: Session,
    },
  },
  {
    headerMode: "none",
  }
);
