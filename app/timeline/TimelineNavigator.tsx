import * as React from "react"
import { StackNavigator } from "react-navigation"
import Timeline, { TimelineHeader } from "../timeline/Timeline"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"
import { NewsContent, NewsContentHeader } from "./NewsContent";
import { ResourceTitle } from "../ui/headers/ResourceTitle";
import { Filter, FilterHeader } from "./Filter";

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
				header: <FilterHeader navigation={ navigation } />,
			}, navigation),
			screen: Filter
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