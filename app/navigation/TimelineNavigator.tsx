import * as React from "react"
import { StackNavigator } from "react-navigation"
import Timeline from "../timeline/Timeline"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export default StackNavigator(
	{
		Timeline: {
			navigationOptions: ({ navigation }) => navOptions({ title: tr.News }, navigation),
			screen: Timeline,
		},
	},
	{
		transitionConfig: customAnimationFunc,
	}
)
