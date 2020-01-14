import I18n from "i18n-js";

import * as React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { connect } from "react-redux";
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

import { FlatButton, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { ErrorMessage } from "../../ui/Typography";
import { News } from "../components/News";

import styles from "../../styles";
import Tracking from "../../tracking/TrackingManager";

import { fetchTimeline, listTimeline } from "../actions/list";
import { fetchPublishableBlogsAction } from '../actions/publish';
import { INewsModel } from "../reducer";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { NavigationScreenProp } from "react-navigation";
import { HeaderAction, HeaderIcon } from "../../ui/headers/NewHeader";
import { ThunkDispatch } from "redux-thunk";
import { IBlogList } from "../state/publishableBlogs";
import { hasNotch } from "react-native-device-info";
import { CommonStyles } from "../../styles/common/styles";
import { TextBold, Text, TextColor } from "../../ui/text";

interface ITimelineProps {
  isFetching: boolean;
  endReached: boolean;
  navigation: any;
  news: any;
  sync: (page: number, availableApps: any, legalapps: any) => Promise<void>;
  fetch: (availableApps: any) => Promise<void>;
  availableApps: any;
  fetchFailed: boolean;
  isAuthenticated: boolean;
  legalapps: any;
  fetchPublishableBlogs: () => void
}


const OptionalCreateButton_Unconnected = ({ blogs, navigation }: { blogs: IBlogList, navigation: NavigationScreenProp<any> }) => blogs.length
  ? <Menu ref={Timeline._createMenuRef} button={
    <HeaderAction
      onPress={() => { Timeline._createMenuRef.current?.show() }}
      name="new_post"
      iconSize={24}
      primary
    />
  }
    style={{
      marginTop: hasNotch ? 20 : 0
    }}>
    <MenuItem disabled
      style={{
        backgroundColor: CommonStyles.lightGrey,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4
      }}
      onPress={() => { }}
    ><TextBold style={{ color: TextColor.Light }}>{I18n.t('createPost-menu-title')}</TextBold></MenuItem>
    <MenuDivider />
    <MenuItem
      onPress={() => { navigation.getParam('onCreatePost') && navigation.getParam('onCreatePost')() }}
    ><Text style={{ color: CommonStyles.textColor }}>{I18n.t('createPost-menu-blog')}</Text></MenuItem>
    <MenuItem disabled
      onPress={() => { }}
    ><Text style={{ color: TextColor.Light, opacity: 0.5 }}>{I18n.t('createPost-menu-news')}</Text></MenuItem>
  </Menu>
  : <HeaderIcon name={null} hidden={true} />
const OptionalCreateButton = connect(
  (state: any) => ({ blogs: state.timeline.publishableBlogs.data })
)(OptionalCreateButton_Unconnected);

// tslint:disable-next-line:max-classes-per-file
class Timeline extends React.Component<ITimelineProps, undefined> {

  static _createMenuRef: React.RefObject<Menu> = React.createRef();

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
    standardNavScreenOptions(
      {
        title: I18n.t("News"),
        headerLeft: <HeaderAction
          onPress={() => {
            navigation.navigate("filterTimeline");
          }}
          name="filter"
        />,
        headerRight: <OptionalCreateButton navigation={navigation} />,
        headerRightContainerStyle: {
          alignItems: "flex-start"
        },
      },
      navigation
    );

  private flatList: any;
  private pageNumber: number = 0;

  constructor(props: ITimelineProps) {
    super(props);
    this.props.fetchPublishableBlogs();
    this.props.navigation.setParams({
      onCreatePost: this.handleCreatePost.bind(this)
    });
  }

  public componentDidMount() {
    this.flatList = null;
    this.pageNumber = 0;
    if (!this.props.isFetching) {
      this.props.sync(
        this.pageNumber,
        this.props.availableApps,
        this.props.legalapps
      );
    }
  }

  public nextPage() {
    if (!this.props.isFetching && this.props.isAuthenticated) {
      this.props.sync(
        ++this.pageNumber,
        this.props.availableApps,
        this.props.legalapps
      );
      Tracking.logEvent("refreshTimeline", { direction: "down" });
    }
  }

  public openNews(item, expend) {
    Tracking.logEvent("readNews", {
      application: item.application,
      articleId: item.id,
      articleName: item.title,
      authorName: item.senderName,
      published: item.date
    });

    this.props.navigation.navigate("newsContent", {
      expend,
      news: item
    });
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.refresh) {
      this.pageNumber = 0;
      this.props.sync(
        this.pageNumber,
        this.props.availableApps,
        this.props.legalapps
      );
      this.pageNumber++;
    }
  }

  public fetchLatest() {
    this.props.fetch(this.props.availableApps);
    Tracking.logEvent("refreshTimeline", { direction: "up" });
  }

  public shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.news !== this.props.news) return true;
    return false;
  }

  public renderList(news) {
    const { isFetching, endReached } = this.props
    const isEmpty = news && news.length === 0;
    return (
      <FlatList
        contentContainerStyle={isEmpty ? { flex: 1 } : null}
        refreshControl={
          <RefreshControl
            refreshing={this.props.isFetching}
            onRefresh={() => this.fetchLatest()}
          />
        }
        data={news}
        onEndReached={() => this.nextPage()}
        onEndReachedThreshold={0.1}
        ref={list => (this.flatList = list)}
        renderItem={({ item, index }) => (
          <News
            {...item as INewsModel}
            index={index}
            onPress={expend => this.openNews(item, expend)}
          />
        )}
        keyExtractor={(item: INewsModel) => item.id.toString()}
        style={styles.gridWhite}
        ListEmptyComponent={
          !isFetching && endReached ?
            <EmptyScreen
              imageSrc={require("../../../assets/images/empty-screen/timeline.png")}
              imgWidth={407}
              imgHeight={319}
              text={I18n.t("timeline-emptyScreenText")}
              title={I18n.t("timeline-emptyScreenTitle")}
            />
            : null
        }
      />
    );
  }

  public renderFetchFailed() {
    return (
      <PageContainer>
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <ErrorMessage style={{ marginBottom: 20, width: "70%" }}>
            {I18n.t("loadingFailedMessage")}
          </ErrorMessage>
          <FlatButton
            onPress={() =>
              this.props.sync(0, this.props.availableApps, this.props.legalapps)
            }
            title={I18n.t("tryagain")}
            loading={this.props.isFetching}
          />
        </View>
      </PageContainer>
    );
  }

  public renderLoading() {
    return <Loading />;
  }

  public render() {
    const { isFetching, fetchFailed, availableApps } = this.props;
    let { news } = this.props;
    const availableAppsWithUppercase = {};
    if (availableApps) {
      Object.keys(availableApps).forEach(app => {
        availableAppsWithUppercase[app] = availableApps[app];
        availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
      });
    }
    if (availableApps) {
      news = news.filter(n => availableAppsWithUppercase[n.type]);
    }

    if (fetchFailed) {
      return this.renderFetchFailed();
    }

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {isFetching ? this.renderLoading() : this.renderList(news)}
      </PageContainer>
    );
  }

  handleCreatePost() {
    Timeline._createMenuRef.current?.hide();
    this.props.navigation.navigate('blogSelect');
  }
}

export default connect(
  (state: any) => ({
    ...state.timeline,
    isAuthenticated: state.user.auth.loggedIn,
    legalapps: state.user.auth.apps
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    fetch: availableApps => fetchTimeline(dispatch)(availableApps),
    sync: (page: number, availableApps, legalapps) =>
      listTimeline(dispatch)(page, availableApps, legalapps),
    fetchPublishableBlogs: () => dispatch(fetchPublishableBlogsAction())
  })
)(Timeline);
