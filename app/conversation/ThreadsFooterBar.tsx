import style from "glamorous-native"
import * as React from "react"
import { CenterPanel } from "../ui/headers/Header";
import { Icon, IconOnOff } from "../ui/index"
import { tr } from "../i18n/t"
import { sendMessage, sendPhoto } from "../actions/conversation"
import { connect } from "react-redux"
import { View, Platform } from "react-native";
import { ToggleIcon } from "../ui/ToggleIcon";
import { Row, Line } from "../ui/Grid";
import { CommonStyles } from "../styles/common/styles";
import { Me } from "../infra/Me";
import { ThreadsTopBar } from "./ThreadsTopBar";

interface IThreadsFooterBarProps {
	conversation: any;
	send: (data: any) => Promise<void>;
}

interface ThreadsFooterBarState {
	selected: Selected
	textMessage: string
}

const ContainerFooterBar = style.view({
	backgroundColor: CommonStyles.tabBottomColor,
	borderTopColor: CommonStyles.borderColorLighter,
	borderTopWidth: 1,
	elevation: 1,
	flexDirection: 'column',
	height: 90,
	justifyContent: 'flex-start'
})

const ChatIcon = style.touchableOpacity({
	alignItems: "center",
	height: 40,
	justifyContent: "center",
	paddingLeft: 20,
	paddingRight: 10,
	width: 58,
});

const SendContainer = style.touchableOpacity({
	alignItems: "center",
	height: 40,
	justifyContent: "center",
	paddingLeft: 20,
	paddingRight: 10,
	paddingBottom: 10,
	width: 58,
	alignSelf: "flex-end"
});

const TextInput = style.textInput({
	width: '100%',
	lineHeight: Platform.OS === 'ios' ? 40 : 20
});

const ContainerInput = style.view({
	height: 40,
	justifyContent: "center",
	paddingLeft: 20,
	paddingRight: 10,
	paddingTop: Platform.OS === 'ios' ? 10 : 0,
	width: '100%',
	flexDirection: 'row'
})

class ThreadsFooterBar extends React.Component<{
	conversation: any
	send: (data: any) => Promise<void>
	sendPhoto: (data: any) => Promise<void>
}, {
	selected: Selected
	textMessage: string
}> {
	
	input: any;

	public state = {
		selected: Selected.none,
		textMessage: "",
	}

	private onPress(e: Selected) {
		const { selected } = this.state

		if(e === Selected.keyboard){
			if(this.state.selected !== Selected.keyboard){
				this.input.innerComponent.focus();
			}
			else{
				this.input.innerComponent.blur();
			}
		}

		this.setState({ selected: e === selected ? Selected.none : e });
		
		if(e === Selected.camera){
			this.sendPhoto();
		}
	}

	private sendPhoto(){
		const { id, displayNames, subject, userId, thread_id } = this.props.conversation;
		const { textMessage } = this.state;

		let conversation = this.props.conversation;

		this.setState({ selected: Selected.none });

		let to = [];
		if(conversation.from === Me.session.userId){
			to = conversation.to;
		}
		else{
			to = [conversation.from];
		}

		this.props.sendPhoto({
			subject: subject,
			to: to,
			cc: conversation.cc,
			parentId: id,
		});
	}

	private onValid() {
		const { id, displayNames, subject, userId, thread_id } = this.props.conversation
		const { textMessage } = this.state

		let conversation = this.props.conversation

		this.setState({ selected: Selected.none })
		let to = []
		if (conversation.from === userId) {
			to = conversation.to
		} else {
			to = [conversation.from]
		}
		this.input.innerComponent.setNativeProps({keyboardType:"email-address"});
		this.input.innerComponent.clear();
		this.props.send(
			{
				subject: subject,
				body: `<div>${textMessage}</div>`,
				to: to,
				cc: conversation.cc,
				parentId: id,
				thread_id: thread_id
			}
		);
		this.setState({
			...this.state,
			textMessage: ''
		});
		
		this.input.innerComponent.setNativeProps({keyboardType:"default"});
	}

	focus(){
		this.setState({ selected: Selected.keyboard })
	}

	public render() {
		const { selected, textMessage } = this.state

		return (
			<ContainerFooterBar>
				<ContainerInput>
					<TextInput
						ref={ el => this.input = el }
						enablesReturnKeyAutomatically={true}
						multiline
						onChangeText={(textMessage: string) => this.setState({ textMessage })}
						onFocus={ () => this.focus() }
						placeholder={tr.Write_a_message}
						underlineColorAndroid={"transparent"}
						value={textMessage}
						autoCorrect={ false }
					/>
				</ContainerInput>
				<Row>
					<ChatIcon onPress={() => this.onPress(Selected.keyboard)}>
						<IconOnOff focused={ true } name={"keyboard"} />
					</ChatIcon>
					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<SendContainer onPress={() => this.onValid()}>
							<ToggleIcon show={ !!this.state.textMessage } icon={ "send_icon" } />
						</SendContainer>
					</View>
					
				</Row>
			</ContainerFooterBar>
		)
	}
}

enum Selected {
	camera,
	keyboard,
	none,
	other,
}

export default connect(
	(state: any) => ({}),
	dispatch => ({
		send: (data: any) => sendMessage(dispatch)(data),
		sendPhoto: (data: any) => sendPhoto(dispatch)(data)
	})
)(ThreadsFooterBar)
