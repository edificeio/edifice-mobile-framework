import * as React from "react"
import { View } from "react-native"
import { stackNavigator } from "../utils/navHelper"
import Conversation from "../connectors/Conversation"
import ReadMail from "../connectors/ReadMail"
import Timeline from "../connectors/Timeline"
import { navOptions } from "../utils/navHelper"
import { tr } from "../i18n/t"

export default stackNavigator({
	Conversation: {
		screen: Conversation,
		navigationOptions: () =>
			navOptions({
				title: tr.conversation,
				headerRight: <View />,
				headerLeft: <View />,
			}),
	},
	ReadMail: {
		screen: ReadMail,
		navigationOptions: () =>
			navOptions({
				title: `Mails`,
				headerRight: <View />,
				headerLeft: <View />,
			}),
	},
	Timeline: {
		screen: Timeline,
		navigationOptions: () =>
			navOptions({
				title: "Calendrier",
				headerRight: <View />,
				headerLeft: <View />,
			}),
	},
})
