import * as React from "react"
import { StackNavigator } from "react-navigation"
import Conversation from "./Conversations"
import { ConversationTopBar } from "../conversation/ConversationTopBar"
import SearchBar from "../ui/SearchBar"
import { PATH_CONVERSATION } from "../constants/paths"
import { ThreadsNavigator } from "./ThreadsNavigator"
import { ThreadsTopBar } from "../conversation/ThreadsTopBar"

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export default StackNavigator(
	{
		Conversation: {
			screen: Conversation,
			navigationOptions: ({ navigation }) => ({
				header: <ConversationTopBar navigation={navigation} />,
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
				header: <ThreadsTopBar navigation={navigation} />,
				tabBarVisible: false,
			}),
		},
	},
	{
		transitionConfig: customAnimationFunc,
	}
)
