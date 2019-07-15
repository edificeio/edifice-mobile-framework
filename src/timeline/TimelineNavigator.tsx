import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { navScreenOptions } from "../navigation/helpers/navHelper";
import {
  FilterHeaderConnect,
  FilterTimelineConnect
} from "./containers/FilterTimeline";
import { NewsContentHeader, NewsContentRouter } from "./containers/NewsContent";
import Timeline, { TimelineHeader } from "./containers/Timeline";

export default createStackNavigator(
  {
    notifications: {
      navigationOptions: ({ navigation }) =>
        navScreenOptions(
          {
            header: <TimelineHeader navigation={navigation} />
          },
          navigation
        ),
      screen: Timeline
    },

    filterTimeline: {
      navigationOptions: ({ navigation }) =>
        navScreenOptions(
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
        navScreenOptions(
          {
            header: <NewsContentHeader navigation={navigation} />,
            tabBarVisible: false
          },
          navigation
        ),
      screen: NewsContentRouter
    }
  },
  {
    headerMode: "screen"
  }
);
