import * as React from "react"
import { FlatList, Text, TouchableNativeFeedback, View } from "react-native"
import { Filter } from "../actions/documents"
import { getSeqNumber } from "../utils/Store"
import styles from "../styles/index"

export interface ITimelineProps {
	documents: any
	navigation?: any
	readDocumentsFilter: (Filter) => void
}

export class Timeline extends React.Component<ITimelineProps, any> {
	public componentWillMount() {
		this.props.readDocumentsFilter(Filter.Shared)
	}

	public renderItem({ name }) {
		return (
			<TouchableNativeFeedback>
				<View style={styles.item}>
					<View>
						<Text>{name}</Text>
					</View>
				</View>
			</TouchableNativeFeedback>
		)
	}

	public render() {
		const { documents } = this.props

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
