import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { standardNavScreenOptions } from "../navigation/helpers/navScreenOptions";

import HomeworkFilterPageHeader from "./components/pages/HomeworkFilterPageHeader";
import HomeworkPageHeader from "./components/pages/HomeworkPageHeader";
import HomeworkFilterPage from "./containers/HomeworkFilterPage";
import HomeworkPage from "./containers/HomeworkPage";
import HomeworkTaskPage from "./containers/HomeworkTaskPage";
import HomeworkTaskPageHeader from "./containers/HomeworkTaskPageHeader";

export default createStackNavigator({
  Homework: {
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
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
      standardNavScreenOptions(
        {
          header: <HomeworkTaskPageHeader navigation={navigation} /> // TS-ISSUE : navigation doest exist in HomeworkTaskPageHeaderProps.
        },
        navigation
      ),
    screen: HomeworkTaskPage
  },

  HomeworkFilter: {
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: <HomeworkFilterPageHeader navigation={navigation} />,
          tabBarVisible: false
        },
        navigation
      ),
    screen: HomeworkFilterPage
  }
});
