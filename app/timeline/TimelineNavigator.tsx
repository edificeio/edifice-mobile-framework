import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";
import {
  FilterHeaderConnect,
  FilterTimelineConnect
} from "./containers/FilterTimeline";
import { NewsContent, NewsContentHeader } from "./containers/NewsContent";
import Timeline, { TimelineHeader } from "./containers/Timeline";

export default createStackNavigator(
  {
    notifications: {
      navigationOptions: ({ navigation }) =>
        navOptions(
          {
            header: <TimelineHeader navigation={navigation} />
          },
          navigation
        ),
      screen: Timeline
    },

    filterTimeline: {
      navigationOptions: ({ navigation }) =>
        navOptions(
          {
            header: <FilterHeaderConnect navigation={navigation} />,
            tabBarVisible: false
          },
          navigation
        ),
      screen: FilterTimelineConnect
    },

    newsContent: {
      navigationOptions: ({ navigation }) =>
        navOptions(
          {
            header: <NewsContentHeader navigation={navigation} />,
            tabBarVisible: false
          },
          navigation
        ),
      screen: NewsContent
    }
  },
  {
    headerMode: "screen"
  }
);
