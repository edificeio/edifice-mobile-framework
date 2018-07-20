import * as React from "react";
import { StackNavigator } from "react-navigation";
import { AppTitle, Header } from "../ui/headers/Header";
import { navOptions } from "../utils/navHelper";

import DiaryPage, { DiaryPageHeader } from "./components/DiaryPage";
import { DiaryTaskPage, DiaryTaskPageHeader } from "./components/DiaryTaskPage";

export default StackNavigator({
  Diary: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <DiaryPageHeader navigation={navigation} />
        },
        navigation
      ),
    screen: DiaryPage
  },

  DiaryTask: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <DiaryTaskPageHeader navigation={navigation} />,
          tabBarVisible: false
        },
        navigation
      ),
    screen: DiaryTaskPage
  }
});
