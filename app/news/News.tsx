import * as React from "react"
import { OptimizedFlatList } from "react-native-optimized-flatlist"
import styles from "../styles/index"
import { ANews } from "./ANews"
import { getSeqNumber } from "../utils/Store"
import { layoutSize } from "../constants/layoutSize"

export interface INewsProps {
	news: any
	navigation?: any
	readNews: (number?) => void
}

export class News extends React.Component<INewsProps, any> {
	private scrollReady = false
	private page = 1

	public renderItem(props) {
		return <ANews {...props} />
	}

	public render() {
		const { news, readNews } = this.props

		return (
			<OptimizedFlatList
				data={news}
				keyExtractor={item => item._id}
				onEndReached={() => {
					if (this.scrollReady) readNews(this.page++)
				}}
				onEndReachedThreshold={0.5}
				onScroll={event => {
					this.scrollReady = true
				}}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}
