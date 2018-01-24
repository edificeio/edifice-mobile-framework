import * as React from "react"
import { FlatList, View } from "react-native"
import { IThreadModel } from "../../model/Thread"
import { getSeqNumber } from "../../utils/Store"
import styles from "../styles/index"
import { Thread } from "./Thread"

export interface ThreadsProps {
	threads: IThreadModel[]
	readConversation: (idConverstion: number) => void
	userId: string
}

export class Threads extends React.Component<ThreadsProps, any> {
	private renderItem(item: IThreadModel) {
		if (!this.props.userId) return <View />
		return <Thread {...item} userId={this.props.userId} />
	}

	public render() {
		const { threads } = this.props

		return (
			<FlatList
				data={threads}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}
