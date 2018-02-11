import * as React from "react"
import { FlatList } from "react-native"
import styles from "../styles/index"
import { connect } from "react-redux"
import { listTimeline } from "../actions/timeline"
import { News } from "./News"
import { View } from "react-native"

export interface ITimelineProps {
	sync: (page: number) => Promise<void>
	news: any
	fetching: boolean
}

class Timeline extends React.Component<ITimelineProps, any> {
	pageNumber: number

	componentDidMount() {
		this.pageNumber = 0
		if (!this.props.fetching) {
			this.props.sync(this.pageNumber)
		}
	}

	nextPage() {
		//	console.log("nextPage")
		if (!this.props.fetching) {
			this.props.sync(++this.pageNumber)
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.news !== this.props.news) return true

		return false
	}

	public render() {
		const { news } = this.props

		if (!news || news.length === 0) return <View />

		return (
			<FlatList
				data={news}
				keyExtractor={item => item.id}
				legacyImplementation={true}
				onEndReached={() => this.nextPage()}
				onEndReachedThreshold={0.1}
				renderItem={({ item }) => <News {...item} />}
				style={styles.grid}
			/>
		)
	}
}

export default connect(
	(state: any) => ({
		news: state.timeline.news,
		fetching: state.timeline.isFetching,
	}),
	dispatch => ({
		sync: (page: number) => listTimeline(dispatch)(page),
	})
)(Timeline)
