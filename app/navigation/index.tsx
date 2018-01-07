///<reference path="../../node_modules/@types/react-navigation/index.d.ts"/>
import {NavigationContainer, StackNavigator} from "react-navigation";
import { navRootOptions, navigator } from "../utils/navHelper"
import ProfilUtilisateurNavigator from "./ProfilNavigator"
import ConversationNavigator from "./ConversationNavigator"
import NouveautesNavigator from "./NouveautesNavigator"
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"



const MainNavigator = navigator({
    Nouveautes: {
        screen: NouveautesNavigator,
        navigationOptions: () => navRootOptions( "Nouveautés", "nouveautes" ),
    },
    Conversation: {
        screen: ConversationNavigator,
        navigationOptions: () => navRootOptions("Conversation", "conversation" ),
    },
    Profil: {
        screen: ProfilUtilisateurNavigator,
        navigationOptions: () => navRootOptions("Profil", "profile" ),
    },
})


export const AppNavigator : NavigationContainer = StackNavigator({
        Bootstrap: {screen: SignupLoginRecover},
        Login: {screen: SignupLoginRecover},
        RecoverPassword: {screen: SignupLoginRecover},
        Main: {screen: MainNavigator},
    },
    {
        navigationOptions: { header: null }
    }
)
