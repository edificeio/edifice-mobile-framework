import * as React from "react"
import { Text, View } from "react-native"
import { errorAlreadyCatched } from "../../constants/errFormInput"
import { MessagesProps } from "../../model/messages"
import styles from "../styles/index"

interface State {
	status: number
	displayMsg: boolean
	statusText: string
}

export interface StatusAlertProps {
	messages?: MessagesProps[]
}
/**
 *
 * @param error
 * @constructor
 */
export class StatusAlert extends React.Component<StatusAlertProps, State> {
	state = {
		status: 0,
		displayMsg: false,
		statusText: "",
	}

	componentWillReceiveProps(newProps) {
		const { status, statusText } = this.getMessage(newProps.messages)
		if (statusText.length > 0 && !this.state.displayMsg) {
			this.setState({ status, displayMsg: true, statusText })
			setTimeout(() => this.setState({ displayMsg: false }), 6000)
		}
	}

	getMessage(messages: MessagesProps) {
		const { status = 0, statusText = "" } = messages[0]

		if (errorAlreadyCatched(status)) {
			return { status: 0, statusText: "" }
		}

		return { status, statusText }
	}

	render() {
		const { status, displayMsg, statusText } = this.state
		if (!displayMsg) return <View />

		const style = status >= 0 && status <= 400 ? styles.containerInfoText : styles.containerErrorText

		return (
			<View style={styles.containerInfo}>
				<Text style={style}>{statusText}</Text>
			</View>
		)
	}
}
