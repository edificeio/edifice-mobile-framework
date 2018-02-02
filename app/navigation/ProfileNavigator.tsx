import * as React from "react"
import { View } from "react-native"
import UserProfile from "../connectors/UserProfile"
import { tr } from "../i18n/t"
import { navOptions } from "../utils/navHelper"
import { CommonStyles } from "../styles/common/styles"
import { StackNavigator } from "react-navigation"

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export default StackNavigator(
	{
		UserProfileNavigator: {
			navigationOptions: () =>
				navOptions({
					headerLeft: <View />,
					headerRight: <View />,
					title: tr.Profile,
				}),
			screen: UserProfile,
		},
	},
	{
		navigationOptions: {
			headerTintColor: CommonStyles.mainColorTheme,
		},
		transitionConfig: customAnimationFunc,
	}
)
