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
import { Icon, Loading, Row } from "../ui";
import I18n from 'react-native-i18n';
import { EmptyScreen } from "../ui/EmptyScreen";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";

export class TimelineHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
		return (
            <Header>
				<Row>
					<HeaderIcon onPress={ () => this.props.navigation.navigate('FilterTimeline') } name={ "filter" } />
					<AppTitle>{ I18n.t('News') }</AppTitle>
					<HeaderIcon name={ "filter" } hidden={ true } />
				</Row>
				<Row>
					<ConnectionTrackingBar />
				</Row>
            </Header>
		)
	}
}

export interface ITimelineProps {
	isFetching: boolean;
	endReached: boolean;
	navigation: any
	news: any
	sync: (page: number, availableApps: any) => Promise<void>;
	availableApps: any;
}

class Timeline extends React.Component<ITimelineProps, undefined> {
	flatList: any;
	pageNumber: number;

	componentDidMount() {
		this.flatList = null
		this.pageNumber = 0
		if (!this.props.isFetching) {
			this.props.sync(this.pageNumber, this.props.availableApps)
		}
	}

	nextPage() {
		if (!this.props.isFetching) {
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
		const { news, isFetching } = this.props;

		if(isFetching) return <Loading />

		if ((!news || news.length === 0) && this.props.endReached) return <EmptyScreen 
			image={ require('../../assets/images/empty-screen/espacedoc.png') } 
			text={ I18n.t('timeline-emptyScreenText') } 
			title={ I18n.t('timeline-emptyScreenTitle') } />

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
	(state: any) => {
		console.log(state.timeline)
		return ({
		...state.timeline
	}) },
	dispatch => ({
		sync: (page: number, availableApps) => listTimeline(dispatch)(page, availableApps),
	})
)(Timeline)


const Separator = () => (
	<style.View>
		<Image source={require("../../assets/images/separator.png")} />
	</style.View>
)
