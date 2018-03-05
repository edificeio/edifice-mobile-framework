//<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import { NavigationContainer, StackNavigator } from "react-navigation";
import { tr } from "../i18n/t"
import { tabNavigator, tabRootOptions } from "../utils/navHelper";
import ProfileNavigator from "./ProfileNavigator";
import TimelineNavigator from "../timeline/TimelineNavigator";
import ConversationNavigator from "../conversation/ConversationNavigator";
import Login from "../auth/Login";
import { View } from 'react-native';

const MainNavigator = tabNavigator({
	Nouveautes: {
		screen: TimelineNavigator,
		navigationOptions: () => tabRootOptions(tr.News, "nouveautes"),
	},
	Conversation: {
		screen: ConversationNavigator,
		navigationOptions: () => tabRootOptions(tr.Conversation, "conversation"),
	},
	Profile: {
		screen: ProfileNavigator,
		navigationOptions: () => tabRootOptions(tr.Profile, "profile"),
	},
})

export const AppNavigator: NavigationContainer = StackNavigator(
	{
		Bootstrap: { screen: View },
		Login: { screen: Login },
		Main: { screen: MainNavigator },
	},
	{
		navigationOptions: { header: null },
	}
)
