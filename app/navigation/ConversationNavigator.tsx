import * as React from "react"
import { ThreadsBar } from "../components/conversation/ThreadsBar"
import Conversation from "../connectors/Conversations"
import { ConversationBar } from "../components/conversation/ConversationBar"
import Threads from "../connectors/Threads"
import SearchBar from "../connectors/ui/SearchBar"
import { PATH_CONVERSATION } from "../constants/paths"
import { StackNavigator } from "react-navigation"
import { tabThreadsNavigator } from "../utils/navHelper"
import { Icon, IconOnOff } from "../components"

const ThreadsNavigator = tabThreadsNavigator({
	ThreadsKeyboard: {
		screen: Threads,
		navigationOptions: () => ({
			tabBarIcon: ({ focused }) => <IconOnOff name={"keyboard"} focused={focused} />,
		}),
	},
	ThreadsCamera: {
		screen: Threads,
		navigationOptions: () => ({
			tabBarIcon: ({ focused }) => <IconOnOff name={"camera"} focused={focused} />,
		}),
	},
	ThreadsValid: {
		screen: Threads,
		navigationOptions: () => ({
			tabBarIcon: ({ focused }) => <Icon name={"send_icon"} focused={focused} />,
		}),
	},
})

export default StackNavigator({
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
		screen: ThreadsNavigator,
		navigationOptions: ({ navigation }) => ({
			header: <ThreadsBar navigation={navigation} />,
			tabBarVisible: false,
		}),
	},
})
