import { NavigationContainer, StackNavigator } from "react-navigation"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import { tr } from "../i18n/t"
import { navigator, navRootOptions } from "../utils/navHelper"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"
import ProfilNavigator from "./ProfilNavigator"

const MainNavigator = navigator({
	Nouveautes: {
		navigationOptions: () => navRootOptions(tr.Nouveautes, "nouveautes"),
		screen: NouveautesNavigator,
	},
	Conversation: {
		navigationOptions: () => navRootOptions(tr.Conversation, "conversation"),
		screen: ConversationNavigator,
	},
	Profil: {
		navigationOptions: () => navRootOptions(tr.Profil, "profile"),
		screen: ProfilNavigator,
	},
})

export const AppNavigator: NavigationContainer = StackNavigator(
	{
		Bootstrap: { screen: SignupLoginRecover },
		Login: { screen: SignupLoginRecover },
		Main: { screen: MainNavigator },
		RecoverPassword: { screen: SignupLoginRecover },
	},
	{
		headerMode: "none",
		navigationOptions: { header: null },
	}
)
