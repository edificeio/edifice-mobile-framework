import * as React from "react"
import Threads from "../connectors/Threads"
import { TabNavigator } from "react-navigation"
import { ThreadsFooterBar } from "../components/conversation/ThreadsFooterBar"

export const ThreadsNavigator = TabNavigator(
	{
		Threads: {
			screen: Threads,
		},
	},
	{
		tabBarComponent: ThreadsFooterBar,
		tabBarPosition: "bottom",
	}
)
