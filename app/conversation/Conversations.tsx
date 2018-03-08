import style from "glamorous-native"
import * as React from "react";
import { Text } from 'react-native';
import { FlatList, View } from 'react-native';
import Swipeable from "react-native-swipeable";
import { IThreadModel, IThreadState } from '../model/Thread';
import styles from "../styles/index"
import { Icon } from "../ui/icons/Icon"
import { Conversation } from "./Conversation"
import { readNextConversation, deleteThread } from '../actions/conversation';
import { IAuthModel } from "../model/Auth"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ModalBox, ModalContent } from "../ui/Modal"
import { ButtonsOkCancel } from "../ui";
import { tr } from "../i18n/t";
import I18n from "react-native-i18n"
import { EmptyScreen } from "../ui/EmptyScreen";
import { PageContainer } from "../ui/ContainerContent";

export interface IConversationsProps {
	conversations: IThreadModel[];
	navigation?: any
	sync: (page: number) => Promise<void>;
	deleteThread: (conversation: IThreadModel) => Promise<void>;
	nbConversations: number;
}

export class Conversations extends React.Component<IConversationsProps, any> {
	pageNumber: number = 0;
	swipeRef = undefined;

	constructor(props){
		super(props);
		this.state = {};
	}

	componentDidMount(){
		this.nextPage();
	}

	public onPress(item) {
		this.props.navigation.navigate("Threads", item)
	}

	private nextPage() {
		for(let i = 0; i < 2; i++){
			this.props.sync(this.pageNumber);
			this.pageNumber ++;
		}
	}

	public render() {
		const { conversations, nbConversations } = this.props;
		if (nbConversations === 0){
			return <EmptyScreen 
				image={ require('../../assets/images/empty-screen/espacedoc.png') } 
				text={ I18n.t('conversation-emptyScreenText') } 
				title={ I18n.t('conversation-emptyScreenTitle') } />
		}

		return (
			<PageContainer>
				<ModalBox backdropOpacity={0.5} isVisible={this.state.deleteThread !== undefined}>
					<ModalContent>
						<Text>{tr.Are_you_sure}</Text>
						<Text>{ I18n.t("conversation-deleteThread") }</Text>
						<ButtonsOkCancel
							onCancel={() => this.setState({ deleteThread: undefined })}
							onValid={() => this.deleteThread(this.state.deleteThread)}
							title={I18n.t("delete")}
						/>
					</ModalContent>
				</ModalBox>
				<FlatList
					data={conversations}
					removeClippedSubviews
					disableVirtualization
					legacyImplementation={true}
					onEndReached={() => this.nextPage()}
					renderItem={({ item }) => this.renderItem(item)}
					style={styles.grid}
					keyboardShouldPersistTaps={ 'always' }
				/>
			</PageContainer>
		)
	}

	deleteThread(conversation){
		this.swipeRef.recenter();
		this.props.deleteThread(conversation);
		this.setState({ deleteThread: undefined });
	}

	swipeoutButton(conversation: IThreadModel){
		return [
			<RightButton onPress={ () => this.setState({ deleteThread: conversation }) }>
				<Icon size={ 18 } color="#ffffff" name="trash" />
			</RightButton>,
		]
	}

	private renderItem(item: IThreadModel) {
		return (
			<Swipeable rightButtons={ this.swipeoutButton(item) } onRightButtonsOpenRelease={ (e, g, r) => this.swipeRef = r }>
				<Conversation {...item} onPress={e => this.onPress(item)} />
			</Swipeable>
		)
	}
}

const RightButton = style.touchableOpacity({
	backgroundColor: "#EC5D61",
	flex: 1,
	justifyContent: "center",
	paddingLeft: 34,
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
		nbConversations: state.threads.payload.length
	}), 
	dispatch => ({
		sync: (page: number) => readNextConversation(dispatch)(page),
		deleteThread: (conversation: IThreadModel) => deleteThread(dispatch)(conversation)
	})
)(Conversations)