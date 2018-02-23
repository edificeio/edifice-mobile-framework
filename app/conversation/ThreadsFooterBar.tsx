import style from "glamorous-native"
import * as React from "react"
import { CenterPanel, ContainerFooterBar, TouchableBarPanel, TouchableEndBarPanel } from "../ui/ContainerBar"
import { layoutSize } from "../constants/layoutSize"
import { Icon, IconOnOff } from "../ui/index"
import { tr } from "../i18n/t"
import { sendMessage } from "../actions/conversation"
import { connect } from "react-redux"
import { View } from "react-native";
import { ToggleIcon } from "../ui/ToggleIcon";

interface IThreadsFooterBarProps {
	navigation?: any
	send: (data: any, userId: string) => Promise<void>
}

interface ThreadsFooterBarState {
	selected: Selected
	textMessage: string
}

class ThreadsFooterBar extends React.Component<IThreadsFooterBarProps, ThreadsFooterBarState> {
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
		this.setState({ selected: e === selected ? Selected.none : e })
	}

	private onValid() {
		const { conversationId, displayNames, subject, userId, thread_id } = this.props.navigation.state.params
		const { textMessage } = this.state

		let conversation = this.props.navigation.state.params

		this.setState({ selected: Selected.none })
		let to = []
		if (conversation.from === userId) {
			to = conversation.to
		} else {
			to = [conversation.from]
		}

		this.input.innerComponent.clear();
		this.props.send(
			{
				subject: subject,
				body: `<div>${textMessage}</div>`,
				to: to,
				cc: conversation.cc,
				parentId: conversationId,
				thread_id: thread_id
			},
			userId
		);
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
						onFocus={ () => this.setState({ selected: Selected.keyboard })}
						placeholder={tr.Write_a_message}
						underlineColorAndroid={"transparent"}
						value={textMessage}
					/>
				</ContainerInput>
				<TouchableBarPanel onPress={() => this.onPress(Selected.keyboard)}>
					<IconOnOff focused={ true } name={"keyboard"} />
				</TouchableBarPanel>
				<TouchableBarPanel onPress={() => this.onPress(Selected.camera)}>
					<IconOnOff focused={selected === Selected.camera} name={"camera"} />
				</TouchableBarPanel>
				<CenterPanel />
				<TouchableEndBarPanel onPress={() => this.onValid()}>
					<ToggleIcon show={ !!this.state.textMessage } icon={ "send_icon" } />
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
		send: (data: any, userId: string) => sendMessage(dispatch)(data, userId),
	})
)(ThreadsFooterBar)
