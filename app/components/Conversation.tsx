import * as React from "react"
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Text, TouchableNativeFeedback, View } from "react-native"
import Swipeable from "react-native-swipeable"
import Icon from "react-native-vector-icons/MaterialIcons"
import { InboxStyle } from "../styles/Inbox"
import { getSeqNumber } from "../utils/Store"
import { Avatar } from "./Avatar"
import styles from "./styles";

const swipeoutBtns = [
	<View style={InboxStyle.hiddenButtons}>
		<Icon name="notifications-off" size={30} />
	</View>,
	<View style={InboxStyle.hiddenButtons}>
		<Icon name="delete" size={30} />
	</View>,
]

export interface ConversationProps {
	inbox: any
	navigation?: any
	readConversation: (number) => void
}

export class Conversation extends React.Component<ConversationProps, any> {
	public componentWillMount() {
		this.props.readConversation(0)
	}

	public renderItem({ author, excerpt, id }) {
		return (
			<Swipeable rightButtons={swipeoutBtns}>
				<TouchableNativeFeedback
					onPress={() =>
						this.props.navigation.navigate("ReadMail", {
							id,
							name: author.name,
						})
					}
				>
					<View style={styles.item}>
						<Avatar userId={author.userId} />
						<View>
							<Text style={InboxStyle.author}>{author.name}</Text>
							<Text style={InboxStyle.excerpt} numberOfLines={1}>
								{excerpt}
							</Text>
						</View>
					</View>
				</TouchableNativeFeedback>
			</Swipeable>
		)
	}

	public render() {
		const { inbox, readConversation } = this.props

		return (
			<FlatList
				data={inbox.threads}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
					if (event.nativeEvent.contentOffset.y === 0) {
						readConversation(inbox.page++)
					}
				}}
                style={styles.grid}
			/>
		)
	}
}
