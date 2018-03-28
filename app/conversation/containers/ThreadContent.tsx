import style from "glamorous-native"
import * as React from "react"
import { FlatList, KeyboardAvoidingView, Platform, RefreshControl } from "react-native"
import { Thread, ConversationState, Message } from "../interfaces";
import styles from "../../styles/index"
import { ChatMessage } from "../components/ChatMessage"
import { sameDay } from "../../utils/date"
import { Row } from "../../ui"
import { tr } from "../../i18n/t"
import { View } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import MediaInput from "./../containers/MediaInput";
import { CommonStyles } from "../../styles/common/styles";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import I18n from "react-native-i18n";
import { readThread, fetchThread, readNextConversation } from "../actions";
import { Carousel } from "../../ui/Carousel";

export interface IThreadsProps {
	navigation?: any;
	syncConversation: (page: number) => Promise<void>;
	readThread: (threadId: string) => Promise<void>;
	fetch: (threadId: string) => Promise<void>;
	threads: Message[];
	headerHeight: number;
	refresh: boolean;
}

export class ThreadContent extends React.Component<IThreadsProps, any> {
	public alreadyDisplayTodayDate: boolean = false
	list: any;

	state = {
		isFetching: false,
		carousel: false,
		images: [],
		currentImage: 0
	};

	async fetchLatest(){
		const { thread_id } = this.props.navigation.state.params;
		this.setState({ isFetching: true });
		await this.props.fetch(thread_id);
		this.setState({ isFetching: false });
	}

	async componentWillReceiveProps(nextProps){
		const { thread_id } = this.props.navigation.state.params;
		if(nextProps.refresh){
			this.props.readThread(thread_id);
		}
	}

	componentWillMount() {
		const { thread_id } = this.props.navigation.state.params;
		this.props.fetch(thread_id);
	}

	public render() {
		const { threads } = this.props;
		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={ Platform.OS === "ios" ? 'padding' : undefined } keyboardVerticalOffset={ this.props.headerHeight }>
				<ConnectionTrackingBar />
				<Carousel 
					startIndex={ this.state.currentImage }
					visible={ this.state.carousel } 
					onClose={ () => this.setState({ carousel: false }) } 
					images={ this.state.images } />
				<FlatList
					refreshControl={ 
						<RefreshControl
							refreshing={ this.state.isFetching }
							onRefresh={ () => this.fetchLatest() }
						/> 
					}
					data={ threads }
					renderItem={({ item }) => this.renderItem(item)}
					style={styles.grid}
					ref={ref => (this.list = ref)}
					inverted={ true }
				/>
				<MediaInput conversation={  this.props.navigation.state.params } />
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

	private showCarousel(imageIndex, images){
		this.setState({
			carousel: true,
			images: images,
			currentImage: imageIndex
		});
	}

	private renderItem(item: Message) {
		return (
			<View key={ item.id }>
				{this.showTodayDate(item) && this.displayTodayDate()}
				<ChatMessage {...item} onOpenImage={ (imageIndex, images) => this.showCarousel(imageIndex, images) } />
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

const filtering = (conversation: ConversationState, thread_id): Message[] => ([
	...conversation.processing.filter(p => p.thread_id === thread_id), 
	...[...conversation.threads.find(t => t.thread_id === thread_id).messages].sort((a, b) => b.date - a.date)
]);

export default connect(
	(state: any, props: any) => ({
		threads: filtering(state.conversation, props.navigation.state.params.thread_id),
		headerHeight: state.ui.headerHeight,
		refresh: state.conversation.refreshThreads
	}), 
	dispatch => ({
		readThread: (threadId: string) => readThread(dispatch)(threadId),
		fetch: (threadId: string) => fetchThread(dispatch)(threadId),
		syncConversation: (page: number) => readNextConversation(dispatch)(page),
	})
)(ThreadContent)