import { NavigationContainer, StackNavigator } from "react-navigation";
import { tabNavigator, tabRootOptions } from "../utils/navHelper";
import TimelineNavigator from "../timeline/TimelineNavigator";
import ConversationNavigator from "../conversation/ConversationNavigator";
import Login from "../auth/Login";
import { View } from 'react-native';
import AccountNavigation from "../auth/AccountNavigation";
import I18n from 'react-native-i18n';
import UiNavigator from "../ui/showcase/UiNavigator";
import HomeworkNavigator from "../homework/HomeworkNavigator";

const MainNavigator = tabNavigator({
	timeline: {
		screen: TimelineNavigator,
		navigationOptions: () => tabRootOptions(I18n.t('News'), "nouveautes"),
	},
	conversation: {
		screen: ConversationNavigator,
		navigationOptions: () => tabRootOptions(I18n.t("Conversation"), "conversation"),
	},
	profile: {
		screen: AccountNavigation,
		navigationOptions: () => tabRootOptions(I18n.t('Profile'), "profile"),
	},
	homework: {
		screen: HomeworkNavigator,
		navigationOptions: () => tabRootOptions(I18n.t('Homework'), "devoirs"),
	},
	ui: {
		screen: UiNavigator,
		navigationOptions: () => tabRootOptions('UI'),
	}
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
