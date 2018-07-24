import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

import DiaryFilterPage, {
  DiaryFilterPageHeader
} from "./components/DiaryFilterPage";
import DiaryPage, { DiaryPageHeader } from "./components/DiaryPage";
import { DiaryTaskPage, DiaryTaskPageHeader } from "./components/DiaryTaskPage";

export default StackNavigator({
  Diary: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: (
            <DiaryPageHeader
              navigation={navigation}
              date={navigation.getParam("diary-date", null)}
            />
          )
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
  },

  DiaryFilter: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <DiaryFilterPageHeader navigation={navigation} />,
          tabBarVisible: false
        },
        navigation
      ),
    screen: DiaryFilterPage
  }
});
