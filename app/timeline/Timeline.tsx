import style from "glamorous-native"
import * as React from "react"
import { FlatList, Image, ScrollView, Modal } from 'react-native';
import { News } from "./News"
import { View } from "react-native"
import styles from "../styles"
import { connect } from "react-redux"
import { listTimeline } from "../actions/timeline"
import { Tracking } from "../tracking/TrackingManager";
import { Header, HeaderIcon, Title, AppTitle } from '../ui/headers/Header';
import { Icon } from "../ui";
import I18n from 'react-native-i18n';

export class TimelineHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
		return (
            <Header>
				<HeaderIcon>
					<Icon size={ 22 } name={ "filter" } color={"#FFFFFF"} onPress={ () => this.props.navigation.navigate('FilterTimeline') } />
				</HeaderIcon>
			    <AppTitle>{ I18n.t('News') }</AppTitle>
				<HeaderIcon>
					<Icon size={ 22 } name={ "filter" } color={"transparent"} />
				</HeaderIcon>
            </Header>
		)
	}
}

export interface ITimelineProps {
	fetching: boolean
	navigation: any
	news: any
	sync: (page: number, availableApps: any) => Promise<void>;
	availableApps: any;
}

class Timeline extends React.Component<ITimelineProps, undefined> {
	flatList: any
	pageNumber: number

	componentDidMount() {
		this.flatList = null
		this.pageNumber = 0
		if (!this.props.fetching) {
			this.props.sync(this.pageNumber, this.props.availableApps)
		}
	}

	nextPage() {
		//	console.log("nextPage")
		if (!this.props.fetching) {
			this.props.sync(++this.pageNumber, this.props.availableApps)
		}
	}

	openNews(item, expend) {
		Tracking.logEvent('readNews', {
			'application': item.application,
			'articleName': item.title,
			'authorName': item.senderName,
			'published': item.date,
			'articleId': item.id
		});
		
		this.props.navigation.navigate('NewsContent', { news: item, expend: expend });
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
				keyExtractor={item => item.id}
				onEndReached={() => this.nextPage()}
				onEndReachedThreshold={0.1}
				ref={list => (this.flatList = list)}
				removeClippedSubviews
				renderItem={({ item, index }) => (
					<News {...item} index={index} onPress={(expend) => this.openNews(item, expend)} />
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
		availableApps: state.timeline.availableApps
	}),
	dispatch => ({
		sync: (page: number, availableApps) => listTimeline(dispatch)(page, availableApps),
	})
)(Timeline)


const Separator = () => (
	<style.View>
		<Image source={require("../../assets/images/separator.png")} />
	</style.View>
)
