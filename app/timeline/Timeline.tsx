import * as React from "react"
import { FlatList } from "react-native"
import styles from "../styles/index"
import { connect } from "react-redux"
import { listTimeline } from "../actions/timeline"
import { News } from "./News"

export interface ITimelineProps {
	sync: (page: number) => Promise<void>
	news: any
	pageNumber: number
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
		console.log("nextPage")
		if (!this.props.fetching) {
			this.pageNumber++
			this.props.sync(this.pageNumber)
		}
	}

	public render() {
		const { news } = this.props

		return (
			<FlatList
				data={news}
				keyExtractor={item => item.id}
				legacyImplementation={true}
				onEndReached={() => this.nextPage()}
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
		pageNumber: 0,
	}),
	dispatch => ({
		sync: (page: number) => listTimeline(dispatch)(page),
	})
)(Timeline)
