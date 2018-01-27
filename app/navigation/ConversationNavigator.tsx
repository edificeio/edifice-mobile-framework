import * as React from "react"
import { Icon } from "../components"
import { SearchIcon } from "../components/ui/icons/SearchIcon"
import { ThreadsBar } from "../components/conversation/ThreadsBar"
import Conversation from "../connectors/Conversations"
import Threads from "../connectors/Threads"
import SearchBar from "../connectors/ui/SearchBar"
import { layoutSize } from "../constants/layoutSize"
import { PATH_CONVERSATION } from "../constants/paths"
import { tr } from "../i18n/t"
import { navOptions, stackNavigator } from "../utils/navHelper"

export default stackNavigator({
	Conversation: {
		navigationOptions: () =>
			navOptions({
				headerLeft: <SearchIcon screen={"ConversationSearch"} />,
				headerRight: <Icon size={layoutSize.LAYOUT_24} name={"new_message"} color={"white"} />,
				title: tr.Conversation,
			}),
		screen: Conversation,
	},
	ConversationSearch: {
		screen: Conversation,
		navigationOptions: ({ navigation }) => ({
			header: <SearchBar navigation={navigation} path={PATH_CONVERSATION} />,
		}),
	},
	Threads: {
		screen: Threads,
		navigationOptions: ({ navigation }) => ({
			header: <ThreadsBar navigation={navigation} />,
		}),
	},
})
