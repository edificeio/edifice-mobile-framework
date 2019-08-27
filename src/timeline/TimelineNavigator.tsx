import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { standardNavScreenOptions } from "../navigation/helpers/navBuilder";
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
        standardNavScreenOptions(
          {
            header: <TimelineHeader navigation={navigation} />
          },
          navigation
        ),
      screen: Timeline
    },

    filterTimeline: {
      navigationOptions: ({ navigation }) =>
        standardNavScreenOptions(
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
        standardNavScreenOptions(
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
