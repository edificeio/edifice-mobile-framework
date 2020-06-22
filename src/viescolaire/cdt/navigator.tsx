import { createStackNavigator } from "react-navigation-stack";

import Homework from "./containers/Homework";
import HomeworkListRelative from "./containers/HomeworkListRelative";
import HomeworkListStudent from "./containers/HomeworkListStudent";
import Session from "./containers/Session";

export default createStackNavigator(
  {
    HomeworkListRelative: {
      screen: HomeworkListRelative,
    },
    HomeworkListStudent: {
      screen: HomeworkListStudent,
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
