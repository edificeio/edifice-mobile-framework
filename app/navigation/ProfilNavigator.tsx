import * as React from "react"
import { View } from "react-native"
import { stackNavigator } from "../utils/navHelper"
import ProfilUtilisateurScreen from "../connectors/ProfilUtilisateur"
import { navOptions } from "../utils/navHelper"

export default stackNavigator({
    ProfilUtilisateurNavigator: {
        screen: ProfilUtilisateurScreen,
        navigationOptions: () =>
            navOptions({
                title: "Conversation",
                headerRight: <View />,
                headerLeft: <View />,
            }),
    },
})
