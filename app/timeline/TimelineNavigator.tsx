import * as React from "react"
import { StackNavigator } from "react-navigation"
import Timeline from "../timeline/Timeline"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"
import { NewsContent } from "./NewsContent";
import { ResourceTitle } from "../ui/headers/ResourceTitle";

export default StackNavigator(
	{
		Timeline: {
			navigationOptions: ({ navigation }) => navOptions({ title: tr.News }, navigation),
			screen: Timeline
		},
		NewsContent: {
			navigationOptions: ({ navigation }) => navOptions({ 
				header: <ResourceTitle title={ navigation.state.params.news.title } subTitle={ navigation.state.params.news.resourceName} navigation={ navigation } />,
				tabBarVisible: false
			}, navigation),
			screen: NewsContent
		}
	}, {
		headerMode: 'screen'
	}
);