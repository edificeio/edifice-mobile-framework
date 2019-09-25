import { createStackNavigator } from "react-navigation";
import HomeworkFilterPage from "./containers/HomeworkFilterPage";
import HomeworkPage from "./containers/HomeworkPage";
import HomeworkTaskPage from "./containers/HomeworkTaskPage";

export default createStackNavigator({
  Homework: {
    screen: HomeworkPage
  },

  HomeworkTask: {
    screen: HomeworkTaskPage
  },

  HomeworkFilter: {
    screen: HomeworkFilterPage
  }
});
