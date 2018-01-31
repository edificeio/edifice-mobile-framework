//<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import { NavigationContainer, StackNavigator } from "react-navigation"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import { tr } from "../i18n/t"
import { tabNavigator, tabRootOptions } from "../utils/navHelper"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"
import ProfilNavigator from "./ProfilNavigator"

const MainNavigator = tabNavigator({
	Nouveautes: {
		screen: NouveautesNavigator,
		navigationOptions: () => tabRootOptions(tr.Nouveautes, "nouveautes"),
	},
	Conversation: {
		screen: ConversationNavigator,
		navigationOptions: () => tabRootOptions(tr.Conversation, "conversation"),
	},
	Profil: {
		screen: ProfilNavigator,
		navigationOptions: () => tabRootOptions(tr.Profil, "profile"),
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
export default AppNavigator
