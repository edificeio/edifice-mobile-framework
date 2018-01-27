import * as React from "react"
import { View } from "react-native"
import ProfilUtilisateur from "../connectors/ProfilUtilisateur"
import { tr } from "../i18n/t"
import { stackNavigator } from "../utils/navHelper"
import { navOptions } from "../utils/navHelper"

export default stackNavigator({
	ProfilUtilisateurNavigator: {
		navigationOptions: () =>
			navOptions({
				headerLeft: <View />,
				headerRight: <View />,
				title: tr.Profil,
			}),
		screen: ProfilUtilisateur,
	},
})
