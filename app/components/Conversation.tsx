import * as React from "react"
import {FlatList, View } from "react-native"
import Swipeable from "react-native-swipeable"
import Icon from "react-native-vector-icons/MaterialIcons"
import { InboxStyle } from "../styles/Inbox"
import { getSeqNumber } from "../utils/Store"
import {Avatars} from "./ui/Avatars/Avatars"
import {ConversationModel} from "../model/Conversation";
import styles from "./styles"
import {Col, ColProperties} from "./ui/Col";
import {Row} from "./ui/Row";
import {DateView} from "./ui/DateView";
import {NonLu} from "./ui/NonLu";
import {clean, trunc} from "../utils/html"
import {layoutSize} from "../constants/layoutSize";
import style from "glamorous-native"
import {CommonStyles} from "./styles/common/styles";


const swipeoutBtns = [
	<View style={InboxStyle.hiddenButtons}>
		<Icon name="notifications-off" />
	</View>,
	<View style={InboxStyle.hiddenButtons}>
		<Icon name="delete" />
	</View>,
]

const Item = ({nb, ...props}) => {
    const backgroundColor = nb > 0 ? "#2A9CC81A" : 'white'

    return (
        <Row
            style={styles.item}
            backgroundColor={backgroundColor}
			{...props}
		/>
    )
}

const ColImage = style.view({
    width: layoutSize.LAYOUT_50,
    height: layoutSize.LAYOUT_50
})

const ColBody= (props: ColProperties) => (
    <Col
        alignItems="flex-start"
        justifyContent="center"
        padding={layoutSize.LAYOUT_2}
		marginHorizontal={layoutSize.LAYOUT_6}
        {...props}
    />
)

const ColRight = style.view({
    alignItems:"center",
    justifyContent:"center",
    width: layoutSize.LAYOUT_50,
    height: layoutSize.LAYOUT_50
})

const Author = style.text( {
		fontSize: layoutSize.LAYOUT_14,
		color: CommonStyles.textColor
	},
	({nb}) => ({
        fontFamily: nb > 0 ? CommonStyles.primaryFontFamilySemibold : CommonStyles.primaryFontFamily,
	})
)

const Content = style.text( {
    fontFamily: CommonStyles.primaryFontFamilyLight,
    fontSize: layoutSize.LAYOUT_12,
	color: CommonStyles.iconColorOff,
	marginTop: layoutSize.LAYOUT_10
})

export interface ConversationProps {
	conversations: any
	navigation?: any
	readConversation: (number) => void
}

function getTitle(displayNames) {
	const title = displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, '')
	return trunc( title, layoutSize.LAYOUT_30)
}

export class Conversation extends React.Component<ConversationProps, any> {
	public componentWillMount() {
		this.props.readConversation(0)
	}

	public renderItem({ subject, date, displayNames, nb } : ConversationModel ) {
		return (
			<Swipeable rightButtons={swipeoutBtns}>
				<Item nb={nb}>
					<ColImage>
						<Avatars displayNames={displayNames} />
					</ColImage>
					<ColBody>
						<Author nb={nb}>{getTitle(displayNames)}</Author>
						{subject.length > 0 ? <Content>{trunc(subject, layoutSize.LAYOUT_36)}</Content> : <View/>}
					</ColBody>
					<ColRight>
						<DateView date={date} nb={nb}/>
						<NonLu nb={nb}/>
					</ColRight>
				</Item>
			</Swipeable>
		)
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
}
