import * as React from "react";
import { StackNavigator } from "react-navigation";
import { AppTitle, Header } from "../ui/headers/Header";
import { navOptions } from "../utils/navHelper";

import { HomeworkPage, HomeworkPageHeader } from "./components/HomeworkPage";
import {
  HomeworkTaskPage,
  HomeworkTaskPageHeader
} from "./components/HomeworkTaskPage";

export default StackNavigator({
  Homework: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <HomeworkPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: HomeworkPage
  },

  HomeworkTask: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <HomeworkTaskPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: HomeworkTaskPage
  }
});
