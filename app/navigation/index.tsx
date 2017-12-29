import { navRootOptions, navigator } from "../utils/navHelper"

import ProfilUtilisateurNavigator from "./ProfilNavigator"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"

export default navigator({
    Nouveautes: {
        screen: NouveautesNavigator,
        navigationOptions: () => navRootOptions( "Nouveautés", "home" ),
    },
    Conversation: {
        screen: ConversationNavigator,
        navigationOptions: () => navRootOptions("Conversation", "account-switch" ),
    },
    Profil: {
        screen: ProfilUtilisateurNavigator,
        navigationOptions: () => navRootOptions("Profil", "account-outline" ),
    },
})
