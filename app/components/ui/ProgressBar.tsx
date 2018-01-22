import * as React from "react"
import { View } from "react-native"
import styles, { deviceWidth } from "../styles/index"

function isSynced(synced) {
	if (synced === undefined) {
		return false
	}
	return synced.reduce((acc, elemIsSync) => acc || elemIsSync, false)
}

interface ProgressBarState {
	width?: number
}

export interface ProgressBarProps {
	synced: boolean[]
}

export class ProgressBar extends React.Component<ProgressBarProps, ProgressBarState> {
	state: ProgressBarState = {
		width: 0,
	}
	timerID = null

	componentWillReceiveProps(newProps) {
		if (!isSynced(newProps.synced)) {
			this.timerID = setInterval(
				() =>
					this.setState({
						width: (this.state.width + deviceWidth / 10) % deviceWidth,
					}),
				400
			)
		}

		if (isSynced(newProps.synced)) {
			clearInterval(this.timerID)
		}
	}

	render() {
		const { synced } = this.props

		return isSynced(synced) ? <View /> : <View style={[styles.loading, { width: this.state.width }]} />
	}
}
