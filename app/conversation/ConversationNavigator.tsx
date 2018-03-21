import * as React from "react"
import { StackNavigator } from "react-navigation"
import Conversation from "./Conversations"
import ConversationTopBar from "../conversation/ConversationTopBar"
import SearchBar from "../ui/SearchBar"
import { PATH_CONVERSATION } from "../constants/paths";
import ThreadsTopBar from "../conversation/ThreadsTopBar"
import Threads from "./Threads";

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
		Threads: {
			screen: Threads,
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
