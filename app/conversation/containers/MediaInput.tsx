import style from "glamorous-native";
import * as React from "react";
import { CommonStyles } from "../../styles/common/styles";
import { Platform, View } from "react-native";
import { tr } from "../../i18n/t";
import { Row, IconOnOff } from "../../ui";
import { ToggleIcon } from "../../ui/ToggleIcon";
import { connect } from "react-redux";
import { Me } from "../../infra/Me";
import { sendMessage } from "../actions/sendMessage";
import { sendPhoto } from "../actions";


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

class MediaInput extends React.Component<{
	conversation: any;
	send: (data: any) => Promise<void>;
	sendPhoto: (data: any) => Promise<void>;
}, {
	selected: Selected;
	textMessage: string;
	newThreadId: string;
}> {
	
	input: any;

	public state = {
		selected: Selected.none,
		textMessage: "",
		newThreadId: undefined
	}

	private switchKeyboard(e: Selected) {
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
		const { textMessage, newThreadId } = this.state;

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
			thread_id: newThreadId || thread_id
		});
	}

	private async onValid() {
		const { id, displayNames, subject, thread_id } = this.props.conversation
		const { textMessage } = this.state

		let conversation = this.props.conversation

		this.setState({ selected: Selected.none })
		let to = []
		if (conversation.from === Me.session.userId) {
			to = conversation.to
		} else {
			to = [conversation.from]
		}
		this.input.innerComponent.setNativeProps({keyboardType:"email-address"});
		this.input.innerComponent.clear();
		
		this.setState({
			...this.state,
			textMessage: ''
		});
		
		this.input.innerComponent.setNativeProps({keyboardType:"default"});

		const newMessage = await this.props.send(
			{
				subject: subject,
				body: `<div>${textMessage}</div>`,
				to: to,
				cc: conversation.cc,
				parentId: id,
				thread_id: thread_id
			}
		);
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
					<ChatIcon onPress={() => this.switchKeyboard(Selected.keyboard)}>
						<IconOnOff focused={ true } name={ "keyboard" } />
					</ChatIcon>
					<ChatIcon onPress={() => this.sendPhoto()}>
						<IconOnOff name={ "camera" } />
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
	(state: any) => ({
		conversation: state.conversation.threads.find(t => t.thread_id === state.conversation.currentThread)
	}),
	dispatch => ({
		send: (data: any) => sendMessage(dispatch)(data),
		sendPhoto: (data: any) => sendPhoto(dispatch)(data)
	})
)(MediaInput)
