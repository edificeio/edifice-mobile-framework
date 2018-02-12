import style from "glamorous-native"
import * as React from "react"
import { CenterPanel, ContainerFooterBar, TouchableBarPanel, TouchableEndBarPanel } from "../ui/ContainerBar"
import { layoutSize } from "../constants/layoutSize"
import { Icon, IconOnOff } from "../ui/index"
import { tr } from "../i18n/t"
import { sendMessage } from "../actions/conversation";
import { connect } from "react-redux";

interface IThreadsFooterBarProps {
	navigation?: any;
	send: (data: any) => Promise<void>
}

interface ThreadsFooterBarState {
	selected: Selected
	textMessage: string
}

class ThreadsFooterBar extends React.Component<IThreadsFooterBarProps, ThreadsFooterBarState> {
	public state = {
		selected: Selected.none,
		textMessage: "",
	}

	private onPress(e: Selected) {
		const { selected } = this.state

		this.setState({ selected: e === selected ? Selected.none : e })
	}

	private onValid() {
		const { conversationId, displayNames, subject, userId } = this.props.navigation.state.params
		const { textMessage } = this.state;

		let user = this.props.navigation.state.params.currentUser;
		let conversation = this.props.navigation.state.params;

		this.setState({ selected: Selected.none });
		console.log(this.props)
		let to = [];
		if(conversation.from === user.userId){
			to = conversation.to;
		}
		else{
			to = [conversation.from];
		}

		this.props.send({
			subject: subject,
			body: `<div>${textMessage}</div>`,
			to: to,
			cc: conversation.cc,
			parentId: conversationId,
		})
	}

	public render() {
		const { selected, textMessage } = this.state

		return (
			<ContainerFooterBar>
				{selected === Selected.keyboard && (
					<ContainerInput>
						<TextInput
							autoFocus={true}
							enablesReturnKeyAutomatically={true}
							multiline
							onChangeText={(textMessage: string) => this.setState({ textMessage })}
							placeholder={tr.Write_a_message}
							underlineColorAndroid={"transparent"}
							value={textMessage}
						/>
					</ContainerInput>
				)}
				<TouchableBarPanel onPress={() => this.onPress(Selected.keyboard)}>
					<IconOnOff focused={selected === Selected.keyboard} name={"keyboard"} />
				</TouchableBarPanel>
				<TouchableBarPanel onPress={() => this.onPress(Selected.camera)}>
					<IconOnOff focused={selected === Selected.camera} name={"camera"} />
				</TouchableBarPanel>
				<CenterPanel />
				<TouchableEndBarPanel onPress={() => this.onValid()}>
					<Icon size={layoutSize.LAYOUT_22} name={"send_icon"} />
				</TouchableEndBarPanel>
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

const ContainerInput = style.view({
	alignSelf: "flex-end",
	height: layoutSize.LAYOUT_56,
	justifyContent: "center",
	paddingLeft: layoutSize.LAYOUT_20,
	paddingRight: layoutSize.LAYOUT_10,
	width: layoutSize.LAYOUT_375,
})

const TextInput = style.textInput({})

export default connect(
	state => ({}),
	dispatch => ({
		send: (data: any) => sendMessage(dispatch)(data)
	})
)(ThreadsFooterBar)