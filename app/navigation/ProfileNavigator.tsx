import * as React from "react"
import { View } from "react-native"
import { tr } from "../i18n/t"
import { navOptions } from "../utils/navHelper"
import { CommonStyles } from "../styles/common/styles"
import { StackNavigator } from "react-navigation"
import UserProfile from "../Profile/UserProfile";

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export default StackNavigator(
	{
		UserProfileNavigator: {
			navigationOptions: ({ navigation }) =>
				navOptions(
					{
						headerLeft: <View />,
						headerRight: <View />,
						title: tr.Profile,
					},
					navigation
				),
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
