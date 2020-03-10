import I18n from "i18n-js";

import * as React from "react";
import { FlatList, RefreshControl, View, Text, Animated } from "react-native";
import { connect } from "react-redux";

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
import { CommonStyles } from "../../styles/common/styles";
import { TempFloatingAction } from "../../ui/FloatingButton";
import { Header } from "../../ui/headers/Header";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

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
  hasCreationRightsMap: { [app in 'blog' | 'news']: boolean }
}

// tslint:disable-next-line:max-classes-per-file
class Timeline extends React.Component<ITimelineProps, undefined> {

  static _createMenuRef: React.RefObject<Menu> = React.createRef();

  private flatList: any;
  private pageNumber: number = 0;

  constructor(props: ITimelineProps) {
    super(props);
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

  public UNSAFE_componentWillReceiveProps(nextProps) {
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

  scale = new Animated.Value(1)

  onZoomEvent = Animated.event(
    [
      {
        nativeEvent: { scale: this.scale }
      }
    ],
    {
      useNativeDriver: true
    }
  )

  onZoomStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(this.scale, {
        toValue: 1,
        useNativeDriver: true
      }).start()
    }
  }

  public render() {
    const { isFetching, fetchFailed, availableApps, navigation } = this.props;
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
        <Header>
          <HeaderAction
            onPress={() => {
              navigation.navigate("filterTimeline");
            }}
            name="filter"
          />
          <Text
            style={{
              alignSelf: "center",
              color: "white",
              fontFamily: CommonStyles.primaryFontFamily,
              fontSize: 16,
              fontWeight: "400",
              textAlign: "center",
              flex: 1
            }}
          >
            {I18n.t("News")}
          </Text>
          <View style={{ width: 60 }}/>
        </Header>
        <ConnectionTrackingBar />
        {/* <PinchGestureHandler
        onGestureEvent={this.onZoomEvent}
        onHandlerStateChange={this.onZoomStateChange}>
        <Animated.Image
          source={{
            uri:
              'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
          }}
          style={{
            width: 400,
            height: 400,
            transform: [{ scale: this.scale }]
          }}
          resizeMode='contain'
        />
      </PinchGestureHandler> */}
        {isFetching ? this.renderLoading() : this.renderList(news)}
        {this.props.hasCreationRightsMap.blog ?
          <TempFloatingAction
            menuItems={
              [{
                text: I18n.t('createPost-menu-blog'),
                icon: "bullhorn",
              },
              // {
              //   text: I18n.t("createPost-menu-news"),
              //   icon: "newspaper",
              //   id: "AddFolder",
              // }
              ]}
            onEvent={() => {
              navigation.getParam('onCreatePost') && navigation.getParam('onCreatePost')("blog")
            }}
            selected={[]}
          />
        : null }
      </PageContainer>
    );
  }

  handleCreatePost(postType: string) {
    Timeline._createMenuRef.current?.hide();
    this.props.navigation.navigate("contentSelect", { postType });
  }
}

export default connect(
  (state: any) => ({
    ...state.timeline,
    isAuthenticated: state.user.auth.loggedIn,
    legalapps: state.user.auth.apps,
    hasCreationRightsMap: state.user.auth.loggedIn && {
      blog: state.user.info.authorizedActions.find(e => e.name === 'org.entcore.blog.controllers.BlogController|publish'),
      news: state.user.info.authorizedActions.find(e => e.name === 'net.atos.entng.actualites.controllers.ThreadController|createThread') // ToDo : Is this the right authorizedAction ?
    }
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    fetch: availableApps => fetchTimeline(dispatch)(availableApps),
    sync: (page: number, availableApps, legalapps) =>
      listTimeline(dispatch)(page, availableApps, legalapps)
  })
)(Timeline);
