import { NavigationContainer, StackNavigator } from "react-navigation";
import { tabNavigator, tabRootOptions } from "../utils/navHelper";
import TimelineNavigator from "../timeline/TimelineNavigator";
import ConversationNavigator from "../conversation/ConversationNavigator";
import Login from "../auth/Login";
import { View } from 'react-native';
import AccountNavigation from "../auth/AccountNavigation";
import I18n from 'react-native-i18n';

const MainNavigator = tabNavigator({
	Nouveautes: {
		screen: TimelineNavigator,
		navigationOptions: () => tabRootOptions(I18n.t('News'), "nouveautes"),
	},
	Conversation: {
		screen: ConversationNavigator,
		navigationOptions: () => tabRootOptions(I18n.t("Conversation"), "conversation"),
	},
	Profile: {
		screen: AccountNavigation,
		navigationOptions: () => tabRootOptions(I18n.t('Profile'), "profile"),
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
