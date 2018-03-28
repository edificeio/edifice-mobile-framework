import style from "glamorous-native"
import * as React from "react"
import { FlatList, Image, ScrollView, Modal, RefreshControl, Button } from 'react-native';
import { News } from "./News"
import { View } from "react-native"
import styles from "../styles"
import { connect } from "react-redux"
import { listTimeline, fetchTimeline } from "../actions/timeline"
import { Tracking } from "../tracking/TrackingManager";
import { Header, HeaderIcon, Title, AppTitle } from '../ui/headers/Header';
import { Icon, Loading, Row, FlatButton } from "../ui";
import I18n from 'react-native-i18n';
import { EmptyScreen } from "../ui/EmptyScreen";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";
import { PageContainer } from '../ui/ContainerContent';
import { ErrorMessage } from '../ui/Typography';

export class TimelineHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
		return (
            <Header>
				<HeaderIcon onPress={ () => this.props.navigation.navigate('FilterTimeline') } name={ "filter" } />
				<AppTitle>{ I18n.t('News') }</AppTitle>
				<HeaderIcon name={ "filter" } hidden={ true } />
            </Header>
		)
	}
}

interface TimelineProps {
	isFetching: boolean;
	endReached: boolean;
	navigation: any
	news: any
	sync: (page: number, availableApps: any) => Promise<void>;
	fetch: (availableApps: any) => Promise<void>;
	availableApps: any;
	fetchFailed: boolean;
	isAuthenticated: boolean;
}

class Timeline extends React.Component<TimelineProps, undefined> {
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
		if (!this.props.isFetching && this.props.isAuthenticated) {
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

	componentWillReceiveProps(nextProps){
		if(nextProps.refresh){
			this.pageNumber = 0;
			this.props.sync(this.pageNumber, this.props.availableApps);
			this.pageNumber ++;
		}
	}

	fetchLatest(){
		this.props.fetch(this.props.availableApps);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.news !== this.props.news) return true

		return false
	}

	list(){
		const { news } = this.props;

		return <FlatList
			refreshControl={ 
				<RefreshControl
					refreshing={ this.props.isFetching }
					onRefresh={ () => this.fetchLatest() }
				/> 
			}
			data={news}
			disableVirtualization
			onEndReached={() => this.nextPage()}
			onEndReachedThreshold={0.1}
			ref={list => (this.flatList = list)}
			removeClippedSubviews
			renderItem={({ item, index }) => (
				<News {...item} key={ item.id } index={index} onPress={(expend) => this.openNews(item, expend)} />
			)}
			style={styles.gridWhite}
		/>
	}

	fetchFailed(){
		return <PageContainer>
			<View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
				<ErrorMessage style={{ marginBottom: 20, width: '70%' }}>{ I18n.t("loadingFailedMessage") }</ErrorMessage>
				<FlatButton onPress={ () => this.props.sync(0, this.props.availableApps) } title={ I18n.t("tryagain") } loading={ this.props.isFetching } />
			</View>
		</PageContainer>
	}

	emptyScreen(){
		return <EmptyScreen 
			image={ require('../../assets/images/empty-screen/espacedoc.png') } 
			text={ I18n.t('timeline-emptyScreenText') } 
			title={ I18n.t('timeline-emptyScreenTitle') } />
	}

	loading(){
		return <Loading />
	}

	public render() {
		const { isFetching, fetchFailed, news } = this.props;

		if(fetchFailed){
			return this.fetchFailed();
		}

		if(!isFetching && (!news || news.length === 0) && this.props.endReached){
			return this.emptyScreen();
		}

		return (
			<PageContainer>
				<ConnectionTrackingBar />
				{ isFetching ? this.loading() : this.list() }
				
			</PageContainer>
		)
	}
}

export default connect(
	(state: any) => ({
		...state.timeline,
		isAuthenticated: state.auth.loggedIn
	}),
	dispatch => ({
		sync: (page: number, availableApps) => listTimeline(dispatch)(page, availableApps),
		fetch: (availableApps) => fetchTimeline(dispatch)(availableApps)
	})
)(Timeline);
