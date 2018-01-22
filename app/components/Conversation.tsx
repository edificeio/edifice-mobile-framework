import style from "glamorous-native"
import * as React from "react"
import { FlatList, View } from "react-native"
import Swipeable from "react-native-swipeable"
import { layoutSize } from "../constants/layoutSize"
import { ConversationModel } from "../model/Conversation"
import { InboxStyle } from "../styles/Inbox"
import { trunc } from "../utils/html"
import { getSeqNumber } from "../utils/Store"
import styles from "./styles"
import { CommonStyles } from "./styles/common/styles"
import { Avatars } from "./ui/Avatars/Avatars"
import { DateView } from "./ui/DateView"
import { Icon } from "./ui/icons/Icon"
import { NonLu } from "./ui/NonLu"

const swipeoutBtns = [
	<View style={InboxStyle.hiddenButtons}>
		<Icon size={layoutSize.LAYOUT_18} color="#ffffff" name="trash" />
	</View>,
]

const Item = style.view(
	{
		backgroundColor: "white",
		borderBottomColor: "#ddd",
		borderBottomWidth: 1,
		flexDirection: "row",
		paddingHorizontal: layoutSize.LAYOUT_16,
		paddingVertical: layoutSize.LAYOUT_12,
	},
	({ nb }) => ({
		backgroundColor: nb > 0 ? "#2A9CC81A" : "white",
	})
)

const LeftPanel = style.view({
	width: layoutSize.LAYOUT_50,
	height: layoutSize.LAYOUT_50,
})

const CenterPanel = style.view({
	alignItems: "flex-start",
	flex: 1,
	justifyContent: "center",
	padding: layoutSize.LAYOUT_2,
	marginHorizontal: layoutSize.LAYOUT_6,
})

const RightPanel = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_50,
	justifyContent: "flex-end",
	width: layoutSize.LAYOUT_50,
})

const Author = style.text(
	{
		color: CommonStyles.textColor,
		fontSize: layoutSize.LAYOUT_14,
	},
	({ nb }) => ({
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamilyLight,
		fontSize: layoutSize.LAYOUT_12,
		marginTop: layoutSize.LAYOUT_10,
	},
	({ nb }) => ({
		color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
		fontFamily: nb > 0 ? CommonStyles.primaryFontFamily : CommonStyles.primaryFontFamilyLight,
	})
)

export interface ConversationProps {
	conversations: any
	navigation?: any
	readConversation: (idConverstion) => void
}

function getTitle(displayNames) {
	const title = displayNames.reduce((acc, elem) => (acc.length === 0 ? elem[1] : `${acc}, ${elem[1]}`), "")
	return trunc(title, layoutSize.LAYOUT_26)
}

export class Conversation extends React.Component<ConversationProps, any> {
	componentWillMount() {
		this.props.readConversation(0)
	}

	renderItem({ subject, date, displayNames, nb }: ConversationModel) {
		return (
			<Swipeable rightButtons={swipeoutBtns}>
				<Item nb={nb}>
					<LeftPanel>
						<Avatars displayNames={displayNames} />
					</LeftPanel>
					<CenterPanel>
						<Author nb={nb}>{getTitle(displayNames)}</Author>
						{subject.length > 0 ? <Content nb={nb}>{trunc(subject, layoutSize.LAYOUT_32)}</Content> : <View />}
					</CenterPanel>
					<RightPanel>
						<DateView date={date} nb={nb} />
						<NonLu nb={nb} />
					</RightPanel>
				</Item>
			</Swipeable>
		)
	}

	render() {
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
}
