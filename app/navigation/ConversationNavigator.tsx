import * as React from "react"
import { ThreadsBar } from "../components/conversation/ThreadsBar"
import Conversation from "../connectors/Conversations"
import { ConversationBar } from "../components/conversation/ConversationBar"
import Threads from "../connectors/Threads"
import SearchBar from "../connectors/ui/SearchBar"
import { PATH_CONVERSATION } from "../constants/paths"
import { navOptions, stackNavigator } from "../utils/navHelper"

export default stackNavigator({
	Conversation: {
		screen: Conversation,
		navigationOptions: ({ navigation }) => ({
			header: <ConversationBar navigation={navigation} />,
		}),
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
