///<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import { NavigationContainer, StackNavigator } from "react-navigation"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import { tr } from "../i18n/t"
import { navigator, navRootOptions } from "../utils/navHelper"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"
import ProfilNavigator from "./ProfilNavigator"

const MainNavigator = navigator({
	Nouveautes: {
		screen: NouveautesNavigator,
		navigationOptions: () => navRootOptions(tr.Nouveautes, "nouveautes"),
	},
	Conversation: {
		screen: ConversationNavigator,
		navigationOptions: () => navRootOptions(tr.Conversation, "conversation"),
	},
	Profil: {
		screen: ProfilNavigator,
		navigationOptions: () => navRootOptions(tr.Profil, "profile"),
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
		headerMode: "none",
	}
)
