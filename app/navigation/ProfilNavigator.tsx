import * as React from "react"
import { View } from "react-native"
import ProfilUtilisateur from "../connectors/ProfilUtilisateur"
import { tr } from "../i18n/t"
import { navOptions } from "../utils/navHelper"
import { CommonStyles } from "../components/styles/common/styles"
import { StackNavigator } from "react-navigation"

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export default StackNavigator(
	{
		ProfilUtilisateurNavigator: {
			navigationOptions: () =>
				navOptions({
					headerLeft: <View />,
					headerRight: <View />,
					title: tr.Profil,
				}),
			screen: ProfilUtilisateur,
		},
	},
	{
		navigationOptions: {
			headerTintColor: CommonStyles.mainColorTheme,
		},
		transitionConfig: customAnimationFunc,
	}
)
