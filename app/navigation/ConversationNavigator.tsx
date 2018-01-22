import * as React from "react"
import { Icon } from "../components"
import { SearchIcon } from "../components/ui/icons/SearchIcon"
import Conversation from "../connectors/Conversation"
import SearchBar from "../connectors/ui/SearchBar"
import { layoutSize } from "../constants/layoutSize"
import { tr } from "../i18n/t"
import { navOptions, stackNavigator } from "../utils/navHelper"

const customAnimationFunc = () => ({
	screenInterpolator: sceneProps => {
		const { scene } = sceneProps
		const tabs = ["Home"]
		if (tabs.indexOf(scene.route.routeName) !== -1) {
			return null
		}
	},
})

export default stackNavigator({
	Conversation: {
		screen: Conversation,
		navigationOptions: () =>
			navOptions({
				title: tr.Conversation,
				headerRight: <Icon size={layoutSize.LAYOUT_24} name={"new_message"} color={"white"} />,
				headerLeft: <SearchIcon screen={"ConversationSearch"} />,
				swipeEnabled: false,
			}),
	},
	ConversationSearch: {
		screen: Conversation,
		navigationOptions: ({ navigation }) => ({
			header: <SearchBar navigation={navigation} storeName={"conversations"} />,
		}),
	},
})
