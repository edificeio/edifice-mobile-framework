import style from "glamorous-native"
import * as React from "react"
import { FlatList } from "react-native"
import { IThreadModel, IThreadState, Message } from "../model/Thread"
import styles from "../styles/index"
import { Thread } from "./Thread"
import { sameDay } from "../utils/date"
import { Row } from "../ui"
import { tr } from "../i18n/t"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { markAsRead, readNextConversation, readNextThreads, readPrevThreads } from "../actions/conversation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { IAction } from '../actions/docs';

export interface IThreadsProps {
	dispatch?: (any) => void
	navigation?: any
	readNextThreads: (any) => IAction;
	readPrevThreads: (any) => IAction;
	synced: any
	threads: Message[]
	userId: any
	pageNumber: any;
}

export class Threads extends React.Component<IThreadsProps, any> {
	public alreadyDisplayTodayDate: boolean = false
	list: any

	componentWillMount() {
		const { conversationId } = this.props.navigation.state.params;
		this.props.readNextThreads(conversationId);
		this.props.readPrevThreads(conversationId);
	}

	public render() {
		const { threads } = this.props;
		return (
			<FlatList
				data={threads}
				keyExtractor={item => item.id}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
				ref={ref => (this.list = ref)}
				onContentSizeChange={() => this.list.scrollToEnd({ animated: true })}
				onLayout={() => this.list.scrollToEnd({ animated: true })}
			/>
		)
	}

	private showTodayDate(item) {
		if (this.alreadyDisplayTodayDate) return false

		if (sameDay(item)) {
			this.alreadyDisplayTodayDate = true
			return true
		}
		return false
	}

	private displayTodayDate() {
		return (
			<Row>
				<Border />
				<Text>{tr.today}</Text>
				<Border />
			</Row>
		)
	}

	private renderItem(item: Message) {
		if (!this.props.userId) {
			return <View />
		}

		return (
			<View>
				{this.showTodayDate(item) && this.displayTodayDate()}
				<Thread {...item} userId={this.props.userId} />
			</View>
		)
	}
}

const Border = style.view({
	backgroundColor: "#DCDDE0",
	flex: 1,
	height: 1,
	marginHorizontal: layoutSize.LAYOUT_10,
})

const Text = style.text({
	alignSelf: "center",
	color: "#FF858FA9",
})


/**
 * Select the thread of conversation with conversation === conversationId
 */
const filtering = (threads: IThreadState, conversationId): Message[] => {
	return [...threads.payload.find(t => t.id === conversationId).messages, ...threads.processing]
}

const mapStateToProps = (state, props) => ({
	threads: filtering(state.threads, props.navigation.state.params.conversationId).sort((a, b) => a.date - b.date),
	pageNumber: state.threads.pageNumber,
	synced: state.threads.synced,
	userId: state.auth.userId,
})

const dispatchAndMapActions = dispatch =>
	bindActionCreators({ readNextThreads, readPrevThreads }, dispatch)

export default connect(mapStateToProps, dispatchAndMapActions)(Threads)