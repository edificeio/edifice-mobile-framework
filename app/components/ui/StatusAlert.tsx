import * as React from "react"
import { Text, View } from "react-native"
import { errorAlreadyCatched } from "../../constants/errFormInput"
import { IMessagesProps } from "../../model/messages"
import styles from "../styles/index"

interface State {
	status: number
	displayMsg: boolean
	statusText: string
}

export interface StatusAlertProps {
	messages?: IMessagesProps[]
}
/**
 *
 * @param error
 * @constructor
 */
export class StatusAlert extends React.Component<StatusAlertProps, State> {
	public state = {
		status: 0,
		displayMsg: false,
		statusText: "",
	}

	public componentWillReceiveProps(newProps) {
		const { status, statusText } = this.getMessage(newProps.messages)
		if (statusText.length > 0 && !this.state.displayMsg) {
			this.setState({ status, displayMsg: true, statusText })
			setTimeout(() => this.setState({ displayMsg: false }), 6000)
		}
	}

	public getMessage(messages: IMessagesProps) {
		const { status = 0, statusText = "" } = messages[0]

		if (errorAlreadyCatched(status)) {
			return { status: 0, statusText: "" }
		}

		return { status, statusText }
	}

	public render() {
		const { status, displayMsg, statusText } = this.state
		if (!displayMsg) {
			return <View />
		}

		const style = status >= 0 && status <= 400 ? styles.containerInfoText : styles.containerErrorText

		return (
			<View style={styles.containerInfo}>
				<Text style={style}>{statusText}</Text>
			</View>
		)
	}
}
