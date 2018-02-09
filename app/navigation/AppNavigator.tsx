//<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import { NavigationContainer, StackNavigator } from "react-navigation"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import { tr } from "../i18n/t"
import { tabNavigator, tabRootOptions } from "../utils/navHelper"
import ConversationNavigator from "./ConversationNavigator"
import ProfileNavigator from "./ProfileNavigator"
import Timeline from "../timeline/Timeline";

const MainNavigator = tabNavigator({
	Nouveautes: {
		screen: Timeline,
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
		Bootstrap: { screen: SignupLoginRecover },
		Login: { screen: SignupLoginRecover },
		RecoverPassword: { screen: SignupLoginRecover },
		Main: { screen: MainNavigator },
	},
	{
		navigationOptions: { header: null },
	}
)
