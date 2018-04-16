import * as React from "react"
import { StackNavigator } from "react-navigation";
import NotificationsSettings, { NotificationsSettingsHeader } from "./containers/NotificationsSettings";
import UserProfile from "./containers/UserProfile";
import I18n from 'react-native-i18n';
import { navOptions } from "../utils/navHelper";

export default StackNavigator(
	{
		userProfile: {
			screen: UserProfile,
			navigationOptions: ({ navigation }) => navOptions({ title: I18n.t('Profile') }, navigation)
		},
		notificationsSettings: {
			screen: NotificationsSettings,
			navigationOptions: ({ navigation }) => ({
				header: <NotificationsSettingsHeader navigation={ navigation }/>
			})
		}
	}
)
