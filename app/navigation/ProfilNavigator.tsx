import * as React from "react"
import { View } from "react-native"
import ProfilUtilisateur from "../connectors/ProfilUtilisateur"
import { tr } from "../i18n/t"
import { stackNavigator } from "../utils/navHelper"
import { navOptions } from "../utils/navHelper"

export default stackNavigator({
	ProfilUtilisateurNavigator: {
		screen: ProfilUtilisateur,
		navigationOptions: () =>
			navOptions({
				title: tr.Profil,
				headerRight: <View />,
				headerLeft: <View />,
			}),
	},
})
