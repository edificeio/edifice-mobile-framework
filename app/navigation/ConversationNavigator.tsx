import * as React from "react"
import Conversation from "../connectors/Conversation"
import {navOptions, stackNavigator} from "../utils/navHelper"
import { tr } from "../i18n/t"
import SearchBar from "../connectors/ui/SearchBar";
import {SearchIcon} from "../components/ui/icons/SearchIcon"
import {layoutSize} from "../constants/layoutSize";
import {Icon} from "../components";



export default stackNavigator({
	Conversation: {
		screen: Conversation,
		navigationOptions: () =>
			navOptions({
				title: tr.Conversation,
				headerRight: <Icon size={layoutSize.LAYOUT_20} name={'new_message'} color={'white'}/>,
				headerLeft: <SearchIcon screen={"ConversationSearch"}/>,
			}),
	},
	ConversationSearch: {
		screen: Conversation,
		navigationOptions: ({navigation}) =>(
			{
                header: <SearchBar navigation={navigation} storeName={'conversations'}/>,
			})
	},
})
