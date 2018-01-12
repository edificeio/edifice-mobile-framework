import * as React from "react"
import { View } from "react-native"
import { stackNavigator } from "../utils/navHelper"
import ProfilUtilisateurScreen from "../connectors/ProfilUtilisateur"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"

export default stackNavigator({
	ProfilUtilisateurNavigator: {
		screen: ProfilUtilisateurScreen,
		navigationOptions: () =>
			navOptions({
				title: tr.Profil,
				headerRight: <View />,
				headerLeft: <View />,
			}),
	},
})
