import style from "glamorous-native"
import * as React from "react"
import { FlatList, Image } from "react-native"
import { News } from "./News"
import { View } from "react-native"
import styles from "../styles"
import { connect } from "react-redux"
import { listTimeline } from "../actions/timeline"


export interface ITimelineProps {
	fetching: boolean
	navigation: any
	news: any
	sync: (page: number) => Promise<void>
}

export interface ITimelineState {
	scrollTo: number
}

class Timeline extends React.Component<ITimelineProps, ITimelineState> {
	flatList: any
	pageNumber: number

	componentDidMount() {
		this.flatList = null
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

	onPress(id: string, index: number, full: boolean) {
		// show/hide header & footer
		this.props.navigation.setParams({ header: full ? null : undefined, tabBar: full ? null : undefined })
		this.flatList.scrollToIndex({ index })
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
				disableVirtualization
				ItemSeparatorComponent={() => <Separator />}
				keyExtractor={item => item.id}
				onEndReached={() => this.nextPage()}
				onEndReachedThreshold={0.1}
				ref={list => (this.flatList = list)}
				removeClippedSubviews
				renderItem={({ item, index }) => (
					<News {...item} index={index} onPress={(id, index, full) => this.onPress(id, index, full)} />
				)}
				style={styles.gridWhite}
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


const Separator = () => (
	<style.View>
		<Image source={require("../../assets/images/separator.png")} />
	</style.View>
)
