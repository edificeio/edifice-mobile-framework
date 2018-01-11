import * as React from "react"
import { FlatList, Text, TouchableNativeFeedback, View } from "react-native"
import { Col } from "."
import { Filter } from "../actions/documents"
import { InboxStyle } from "../styles/Inbox"
import { getSeqNumber } from "../utils/Store"
import styles from "./styles"

export interface TimelineProps {
	documents: any
	navigation?: any
	readDocumentsFilter: (Filter) => void
}

export class Timeline extends React.Component<TimelineProps, any> {
	public componentWillMount() {
		this.props.readDocumentsFilter(Filter.Shared)
	}

	public renderItem({ title }) {
		return (
			<TouchableNativeFeedback>
				<View style={styles.item}>
					<View>
						<Text style={InboxStyle.author}>{title}</Text>
					</View>
				</View>
			</TouchableNativeFeedback>
		)
	}

	public render() {
		const { documents, navigation } = this.props

		return (
			<FlatList
				data={documents}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}
