import * as React from "react"
import { Icon } from "../components"
import { SearchIcon } from "../components/ui/icons/SearchIcon"
import Conversation from "../connectors/Conversations"
import SearchBar from "../connectors/ui/SearchBar"
import { layoutSize } from "../constants/layoutSize"
import { tr } from "../i18n/t"
import { navOptions, stackNavigator } from "../utils/navHelper"
import Threads from "../connectors/Threads"
import { PATH_CONVERSATION } from "../constants/paths"
import { ThreadsBar } from "../components/ui/ThreadsBar"

export default stackNavigator({
	Conversation: {
		screen: Conversation,
		navigationOptions: () =>
			navOptions({
				title: tr.Conversation,
				headerRight: <Icon size={layoutSize.LAYOUT_24} name={"new_message"} color={"white"} />,
				headerLeft: <SearchIcon screen={"ConversationSearch"} />,
			}),
	},
	Threads: {
		screen: Threads,
		navigationOptions: ({ navigation }) => ({
			header: <ThreadsBar navigation={navigation} />,
		}),
	},
	ConversationSearch: {
		screen: Conversation,
		navigationOptions: ({ navigation }) => ({
			header: <SearchBar navigation={navigation} path={PATH_CONVERSATION} />,
		}),
	},
})
