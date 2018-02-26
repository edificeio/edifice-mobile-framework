import style from "glamorous-native"
import * as React from "react"
import { SwipeListView } from 'react-native-swipe-list-view';
import { FlatList } from "react-native"
import Swipeable from "react-native-swipeable"
import { layoutSize } from "../constants/layoutSize"
import { IThreadModel, IThreadState } from '../model/Thread';
import styles from "../styles/index"
import { Icon } from "../ui/icons/Icon"
import { Conversation } from "./Conversation"
import { readNextConversation, deleteThread } from '../actions/conversation';
import { IAuthModel } from "../model/Auth"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ModalBox, ModalContent } from "../ui/Modal"

export interface IConversationsProps {
	conversations: IThreadModel[];
	navigation?: any
	sync: (page: number) => Promise<void>;
	deleteThread: (conversation: IThreadModel) => Promise<void>;
	userId: string
}

export class Conversations extends React.Component<IConversationsProps, any> {
	pageNumber: number = 0;
	swipeRef = undefined;

	public onPress(item) {
		this.props.navigation.navigate("Threads", item)
	}

	private nextPage() {
		for(let i = 0; i < 2; i++){
			this.pageNumber ++;
			this.props.sync(this.pageNumber);
		}
	}

	public render() {
		const { conversations, userId } = this.props;
		return (
			<FlatList
				data={conversations}
				removeClippedSubviews
				disableVirtualization
				legacyImplementation={true}
				onEndReached={() => this.nextPage()}
				renderItem={({ item }) => this.renderItem(item, userId)}
				style={styles.grid}
				keyboardShouldPersistTaps={ 'always' }
			/>
		)
	}

	deleteThread(conversation){
		this.swipeRef.recenter();
		this.props.deleteThread(conversation);
		
	}

	swipeoutButton(conversation: IThreadModel){
		return [
			<RightButton onPress={ () => this.deleteThread(conversation) }>
				<Icon size={layoutSize.LAYOUT_18} color="#ffffff" name="trash" />
			</RightButton>,
		]
	}

	private renderItem(item: IThreadModel, userId) {
		return (
			<Swipeable rightButtons={ this.swipeoutButton(item) } onRightButtonsOpenRelease={ (e, g, r) => this.swipeRef = r }>
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
});

function getTitle(displayNames) {
	return displayNames.reduce((acc, elem) => `${acc}, ${elem[1]}`, "")
}

/**
 * Select the set of conversations with the filtering criteria
 */

export default connect(
	(state: any) => ({
		conversations: state.threads.payload.filter(
			t => !state.threads.filterCriteria || (t.subject && t.subject.toLowerCase().indexOf(state.threads.filterCriteria.toLowerCase()) !== -1)
		),
		userId: state.auth.userId
	}), 
	dispatch => ({
		sync: (page: number) => readNextConversation(dispatch)(page),
		deleteThread: (conversation: IThreadModel) => deleteThread(dispatch)(conversation)
	})
)(Conversations)