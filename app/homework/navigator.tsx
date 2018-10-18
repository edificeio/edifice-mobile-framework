import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navScreenOptions } from "../navigation/helpers/navHelper";

import HomeworkFilterPageHeader from "./components/pages/HomeworkFilterPageHeader";
import HomeworkPageHeader from "./components/pages/HomeworkPageHeader";
import HomeworkFilterPage from "./containers/HomeworkFilterPage";
import HomeworkPage from "./containers/HomeworkPage";
import HomeworkTaskPage from "./containers/HomeworkTaskPage";
import HomeworkTaskPageHeader from "./containers/HomeworkTaskPageHeader";

export default createStackNavigator({
  Homework: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
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
      navScreenOptions(
        {
          header: <HomeworkTaskPageHeader navigation={navigation} /> // TS-ISSUE : navigation doest exist in HomeworkTaskPageHeaderProps.
        },
        navigation
      ),
    screen: HomeworkTaskPage
  },

  HomeworkFilter: {
    navigationOptions: ({ navigation }) =>
      navScreenOptions(
        {
          header: <HomeworkFilterPageHeader navigation={navigation} />,
          tabBarVisible: false
        },
        navigation
      ),
    screen: HomeworkFilterPage
  }
});
