import style from "glamorous-native"
import * as React from "react"
import { FlatList } from "react-native"
import Swipeable from "react-native-swipeable"
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel } from "../model/Thread"
import styles from "../styles/index"
import { Icon } from "../ui/icons/Icon"
import { Conversation } from "./Conversation"
import { readConversation } from "../actions/conversation"
import { IAuthModel } from "../model/Auth"

export interface IConversationsProps {
	conversations: IThreadModel[]
	pageNumber: number
	navigation?: any
	readConversation
	readNextConversation
	synced: boolean
	userId: string
}

export class Conversations extends React.Component<IConversationsProps, any> {
	public onPress(item: IThreadModel) {
		;(item as any).conversationId = item.id

		this.props.navigation.navigate("Threads", item)
	}

	private nextPage() {
		const { pageNumber } = this.props
		//	console.log("nextPage")
		if (this.props.synced) {
			this.props.readNextConversation(pageNumber + 1)
		}
	}

	public render() {
		const { conversations, userId } = this.props

		return (
			<FlatList
				data={conversations}
				keyExtractor={item => item.id}
				removeClippedSubviews
				disableVirtualization
				legacyImplementation={true}
				onEndReached={() => this.nextPage()}
				renderItem={({ item }) => this.renderItem(item, userId)}
				style={styles.grid}
			/>
		)
	}

	private renderItem(item: IThreadModel, userId) {
		return (
			<Swipeable rightButtons={swipeoutBtns}>
				<Conversation {...item} onPress={e => this.onPress(item)} userId={userId} />
			</Swipeable>
		)
	}
}

const RightButton = style.touchableOpacity({
	backgroundColor: "#EC5D61",
	flex: 1,
	justifyContent: "center",
	paddingLeft: layoutSize.LAYOUT_34,
})

const swipeoutBtns = [
	<RightButton>
		<Icon size={layoutSize.LAYOUT_18} color="#ffffff" name="trash" />
	</RightButton>,
]
