import style from "glamorous-native"
import * as React from "react"
import { FlatList, KeyboardAvoidingView, Platform } from "react-native"
import { IThreadModel, IThreadState, Message } from "../model/Thread"
import styles from "../styles/index"
import { Thread } from "./Thread"
import { sameDay } from "../utils/date"
import { Row } from "../ui"
import { tr } from "../i18n/t"
import { View } from "react-native";
import { readNextConversation, readThread } from "../actions/conversation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { IAction } from '../actions/docs';
import ThreadsFooterBar from "./ThreadsFooterBar";
import { CommonStyles } from "../styles/common/styles";

export interface IThreadsProps {
	navigation?: any
	readThread: (threadId: string) => Promise<void>;
	threads: Message[];
}

export class Threads extends React.Component<IThreadsProps, any> {
	public alreadyDisplayTodayDate: boolean = false
	list: any

	componentWillMount() {
		const { thread_id } = this.props.navigation.state.params;
		this.props.readThread(thread_id);
	}

	public render() {
		const { threads } = this.props;
		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={ Platform.OS === "ios" ? 'padding' : undefined } keyboardVerticalOffset={ 70 }>
				<FlatList
					data={threads}
					renderItem={({ item }) => this.renderItem(item)}
					style={styles.grid}
					ref={ref => (this.list = ref)}
					onContentSizeChange={() => this.list.scrollToEnd({ animated: true })}
					onLayout={() => this.list.scrollToEnd({ animated: true })}
				/>
				<ThreadsFooterBar conversation={  this.props.navigation.state.params } />
			</KeyboardAvoidingView>
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
		return (
			<View key={ item.id }>
				{this.showTodayDate(item) && this.displayTodayDate()}
				<Thread {...item} />
			</View>
		)
	}
}

const Border = style.view({
	backgroundColor: "#DCDDE0",
	flex: 1,
	height: 1,
	marginHorizontal: 10,
})

const Text = style.text({
	alignSelf: "center",
	color: "#FF858FA9",
})

const filtering = (threads: IThreadState, thread_id): Message[] => {
	return [...threads.payload.find(t => t.thread_id === thread_id).messages, ...threads.processing]
}

export default connect(
	(state: any, props: any) => ({
		threads: filtering(state.threads, props.navigation.state.params.thread_id).sort((a, b) => a.date - b.date)
	}), 
	dispatch => ({
		readThread: (threadId: string) => readThread(dispatch)(threadId)
	})
)(Threads)