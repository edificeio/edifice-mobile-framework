///<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import { NavigationContainer, StackNavigator } from "react-navigation"
import { navRootOptions, navigator } from "../utils/navHelper"
import ProfilUtilisateurNavigator from "./ProfilNavigator"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import { tr } from "../i18n/t"

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
		screen: ProfilUtilisateurNavigator,
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
        headerMode: 'none',
	}
)
