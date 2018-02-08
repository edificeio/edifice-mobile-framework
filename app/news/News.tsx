import * as React from "react"
import { OptimizedFlatList } from "react-native-optimized-flatlist"
import styles from "../styles/index"
import { ANews } from "./ANews"
import { getSeqNumber } from "../utils/Store"

export interface INewsProps {
	news: any
	navigation?: any
	readNews: (number?) => void
}

export class News extends React.Component<INewsProps, any> {
	private page = 1
	public componentWillMount() {
		this.props.readNews()
	}

	public renderItem(props) {
		return <ANews {...props} />
	}

	public render() {
		const { news, readNews } = this.props

		return (
			<OptimizedFlatList
				data={news}
				keyExtractor={() => getSeqNumber()}
				onEndReached={() => {
					readNews(this.page++)
				}}
				onEndReachedThreshold={0.1}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}
