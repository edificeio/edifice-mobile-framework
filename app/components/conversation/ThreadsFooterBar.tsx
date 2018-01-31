import * as React from "react"
import { CenterPanel, ContainerFooterBar, TouchableBarPanel, TouchableEndBarPanel } from "../ui/ContainerBar"
import { layoutSize } from "../../constants/layoutSize"
import { Icon, IconOnOff } from ".."
import { tr } from "../../i18n/t"
import style from "glamorous-native"
import { TextInput } from "react-native"


export interface IThreadsFooterBarProps {
	createConversation: (object) => void
	navigation?: any
}

interface ThreadsFooterBarState {
	selected: Selected
	textMessage: string
}

export class ThreadsFooterBar extends React.Component<IThreadsFooterBarProps, ThreadsFooterBarState> {
	public state = {
		selected: Selected.none,
		textMessage: "",
	}

	private onPress(e: Selected) {
		const { selected } = this.state

		this.setState({ selected: e === selected ? Selected.none : e })
	}

	private onValid() {
		const { conversationId, displayNames, subject } = this.props.navigation.state.params
		const { textMessage } = this.state
		this.setState({ selected: Selected.none })

		this.props.createConversation({
			parent_id: this.props.navigation.state.params.conversationId,
			subject: subject,
			body: `<br><br><div class="signature new-signature">${textMessage}</div>`,
			from: "14a1cb35-e943-4f06-917a-f163461d5b14",
			fromName: null,
			to: ["e4d5cd13-d44c-4bd8-8f8e-a3e8ad3d2ca5"],
			toName: null,
			cc: [],
			ccName: null,
			displayNames: displayNames,
			date: Date.now(),
			conversation: conversationId,
		})
	}

	public render() {
		const { selected, textMessage } = this.state

		return (
			<ContainerFooterBar>
				{selected === Selected.keyboard && (
					<ContainerInput>
						<TextInput
							placeholder={tr.Ecrivez_un_message}
							multiline
							onChangeText={(textMessage: string) => this.setState({ textMessage })}
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
				<TouchableBarPanel onPress={() => this.onPress(Selected.other)}>
					<Icon size={layoutSize.LAYOUT_22} name={"more"} />
				</TouchableBarPanel>
				<CenterPanel />
				<TouchableEndBarPanel onPress={() => this.onValid()}>
					<Icon size={layoutSize.LAYOUT_22} name={"send_icon"} />
				</TouchableEndBarPanel>
			</ContainerFooterBar>
		)
	}
}

export enum Selected {
	camera,
	keyboard,
	none,
	other,
}

export const ContainerInput = style.view({
	alignSelf: "flex-end",
	height: layoutSize.LAYOUT_56,
	justifyContent: "center",
	paddingLeft: layoutSize.LAYOUT_20,
	paddingRight: layoutSize.LAYOUT_10,
	width: layoutSize.LAYOUT_375,
})
