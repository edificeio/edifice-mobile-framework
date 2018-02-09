import * as React from "react"
import { FlatList, Text, TouchableNativeFeedback, View, Image } from "react-native"
import { getSeqNumber } from "../utils/Store"
import styles from "../styles/index"
import { connect } from "react-redux";
import { listTimeline } from '../actions/timeline';

export interface ITimelineProps {
	sync: (page: number) => Promise<void>;
	news: any,
	pageNumber: number
}

class Timeline extends React.Component<ITimelineProps, any> {

	pageNumber: number;

	componentDidMount(){
		this.pageNumber = 0;
		this.props.sync(this.pageNumber).then(() => console.log(this.props));
	}

	public renderItem({ senderName, resourceName, message, images }) {
		return (
			<TouchableNativeFeedback>
				<View style={styles.item}>
					<View>
						<Text>{senderName} dans {resourceName}</Text>
					</View>
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

	nextPage(){
		this.pageNumber++;
		this.props.sync(this.pageNumber);
	}

	public render() {
		const { news } = this.props

		return (
			<FlatList
				data={news}
				keyExtractor={() => getSeqNumber()}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
				onEndReached={() => this.nextPage() }
			/>
		)
	}
}

export default connect(
	(state:any) => ({
		news: state.timeline.news,
		pageNumber: 0
	}),
	dispatch => ({
		sync: (page: number) => listTimeline(dispatch)(page)
	})
)(Timeline)