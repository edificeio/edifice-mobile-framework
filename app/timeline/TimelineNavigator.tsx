import * as React from "react";
import { StackNavigator } from "react-navigation";
import { navOptions } from "../utils/navHelper";
import { ResourceTitle } from "../ui/headers/ResourceTitle";
import Timeline, { TimelineHeader } from "./containers/Timeline";
import { FilterHeaderConnect, FilterTimelineConnect } from "./containers/FilterTimeline";
import { NewsContentHeader, NewsContent } from "./containers/NewsContent";

export default StackNavigator(
	{
		Timeline: {
			navigationOptions: ({ navigation }) => navOptions({ 
				header: <TimelineHeader navigation={ navigation } />
			}, navigation),
			screen: Timeline
		},
		FilterTimeline: {
			navigationOptions: ({ navigation }) => navOptions({ 
				header: <FilterHeaderConnect navigation={ navigation } />,
				tabBarVisible: false
			}, navigation),
			screen: FilterTimelineConnect
		},
		NewsContent: {
			navigationOptions: ({ navigation }) => navOptions({ 
				header: <NewsContentHeader navigation={ navigation } />,
				tabBarVisible: false
			}, navigation),
			screen: NewsContent
		}
	}, {
		headerMode: 'screen'
	}
);