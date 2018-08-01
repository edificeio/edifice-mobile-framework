import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

import DiaryFilterPageHeader from "./components/DiaryFilterPageHeader";
import DiaryPageHeader from "./components/DiaryPageHeader";
import DiaryFilterPage from "./containers/DiaryFilterPage";
import DiaryPage from "./containers/DiaryPage";
import DiaryTaskPage from "./containers/DiaryTaskPage";
import DiaryTaskPageHeader from "./containers/DiaryTaskPageHeader";

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
          header: <DiaryTaskPageHeader navigation={navigation} />, // TS-ISSUE : navigation doest exist in DiaryTaskPageHeaderProps.
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
