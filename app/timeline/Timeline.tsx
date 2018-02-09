import * as React from "react"
import { FlatList, Text, TouchableNativeFeedback, View, Image } from "react-native"
import { getSeqNumber } from "../utils/Store"
import styles from "../styles/index"
import { connect } from "react-redux";
import { listTimeline } from '../actions/timeline';

export interface ITimelineProps {
	sync: (page: number) => Promise<void>;
	news: any
}

class Timeline extends React.Component<ITimelineProps, any> {
	componentDidMount(){
		console.log(this.props);
		this.props.sync(0).then(() => console.log(this.props));
		console.log(this.state)
	}

	public renderItem({ message, images }) {
		return (
			<TouchableNativeFeedback>
				<View style={styles.item}>
					<View>
						<Text>{message}</Text>
					</View>
					<View>
						<Image style={{ width: 320, height: 165 }} source={{uri: images[0] }} />
					</View>
				</View>
			</TouchableNativeFeedback>
		)
	}

	public render() {
		const { news } = this.props

		return (
			<FlatList
				data={news}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
			/>
		)
	}
}

export default connect(
	(state:any) => ({
		news: state.timeline.news
	}),
	dispatch => ({
		sync: (page: number) => listTimeline(dispatch)(page)
	})
)(Timeline)