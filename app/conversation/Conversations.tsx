import style from "glamorous-native"
import * as React from "react"
import { FlatList } from "react-native"
import Swipeable from "react-native-swipeable"
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel } from "../model/Thread"
import { getSeqNumber } from "../utils/Store"
import styles from "../styles/index"
import { Icon } from "../ui/icons/Icon"
import { Conversation } from "./Conversation"

export interface IConversationsProps {
	conversations: IThreadModel[]
	navigation?: any
	readConversation: (idConverstion: number) => void
}

export class Conversations extends React.Component<IConversationsProps, any> {
	public componentWillMount() {
		this.props.readConversation(0)
	}

	public onPress(id: string, displayNames: string[][], subject: string) {
		this.props.navigation.navigate("Threads", { conversationId: id, displayNames, subject })
	}

	public render() {
		const { conversations } = this.props

		return (
			<FlatList
				data={conversations}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}

	private renderItem(item: IThreadModel) {
		return (
			<Swipeable rightButtons={swipeoutBtns}>
				<Conversation {...item} onPress={(id, displayNames, subject) => this.onPress(id, displayNames, subject)} />
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
