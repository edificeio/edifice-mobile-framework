import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";

import HomeworkFilterPageHeader from "./components/pages/HomeworkFilterPageHeader";
import HomeworkPageHeader from "./components/pages/HomeworkPageHeader";
import HomeworkFilterPage from "./containers/HomeworkFilterPage";
import HomeworkPage from "./containers/HomeworkPage";
import HomeworkTaskPage from "./containers/HomeworkTaskPage";
import HomeworkTaskPageHeader from "./containers/HomeworkTaskPageHeader";

export default StackNavigator({
  Homework: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: (
            <HomeworkPageHeader
              navigation={navigation}
              date={navigation.getParam("homework-date", null)}
            />
          )
        },
        navigation
      ),
    screen: HomeworkPage
  },

  HomeworkTask: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <HomeworkTaskPageHeader navigation={navigation} />, // TS-ISSUE : navigation doest exist in HomeworkTaskPageHeaderProps.
          tabBarVisible: false
        },
        navigation
      ),
    screen: HomeworkTaskPage
  },

  HomeworkFilter: {
    navigationOptions: ({ navigation }) =>
      navOptions(
        {
          header: <HomeworkFilterPageHeader navigation={navigation} />,
          tabBarVisible: false
        },
        navigation
      ),
    screen: HomeworkFilterPage
  }
});
