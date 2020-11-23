import I18n from "i18n-js";

import * as React from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import { connect } from "react-redux";

import { FlatButton, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { ErrorMessage } from "../../ui/Typography";
import { News } from "../components/News";
import { FlashNews } from "../components/FlashNews";
import styles from "../../styles";
import Notifier from "../../infra/notifier/container";
import { fetchTimeline, listTimeline } from "../actions/list";
import { fetchPublishableBlogsAction } from '../actions/publish';
import { INewsModel, IFlashMessageModel } from "../reducer";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { ThunkDispatch } from "redux-thunk";
import { CommonStyles } from "../../styles/common/styles";
import { TempFloatingAction } from "../../ui/FloatingButton";
import { Header } from "../../ui/headers/Header";
import { IBlogList } from "../state/publishableBlogs";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { fetchFlashMessagesAction, markFlashMessageAsReadAction } from "../actions/flashList";

interface ITimelineProps {
  isFetching: boolean;
  endReached: boolean;
  navigation: any;
  news: any;
  flashMessages: any;
  sync: (page: number, availableApps: any, legalapps: any) => Promise<void>;
  fetch: (availableApps: any) => Promise<void>;
  fetchFlashMessages: () => Promise<void>;
  dismissFlashMessage: (flashMessageId: string) => Promise<void>;
  availableApps: any;
  fetchFailed: boolean;
  isAuthenticated: boolean;
  legalapps: any;
  authorizedActions: any;
  publishableBlogs: IBlogList;
  onMount: () => void;
}

// tslint:disable-next-line:max-classes-per-file
class Timeline extends React.Component<ITimelineProps, ITimelineState> {

  static _createMenuRef: React.RefObject<Menu> = React.createRef();

  private flatList: any;
  private pageNumber: number = 0;

  constructor(props: ITimelineProps) {
    super(props);
    this.props.navigation.setParams({
      onCreatePost: this.handleCreatePost.bind(this)
    });
  }

  public componentDidUpdate(prevProps: any) {
    const { isFetching } = this.props
    if(prevProps.isFetching !== isFetching){
      this.setState({ initialFetch: false });
    }
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
    this.props.onMount && this.props.onMount();
  }

  public nextPage() {
    if (!this.props.isFetching && this.props.isAuthenticated) {
      this.props.sync(
        ++this.pageNumber,
        this.props.availableApps,
        this.props.legalapps
      );
    }
  }

  public openNews(item, expend) {
    this.props.navigation.navigate("newsContent", {
      expend,
      news: item
    });
  }

  public dismissFlashMessage (flashMessageId: number) {
    const id = flashMessageId.toString();
    this.props.dismissFlashMessage(id);
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
    this.props.fetchFlashMessages();
  }

  public shouldComponentUpdate(nextProps) {
    if (nextProps.news !== this.props.news) return true;
    if (nextProps.flashMessages !== this.props.flashMessages) return true;
    return false;
  }

  public renderList(news: Array<IFlashMessageModel | INewsModel>) {
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
        renderItem={({ item, index }: { item: IFlashMessageModel | INewsModel, index: number }) => item.type === "FLASHMESSAGE"
          ? <FlashNews
              {...item as IFlashMessageModel}
              onPress={() => this.dismissFlashMessage((item as IFlashMessageModel).id)}
            />
          : <News
              {...item  as INewsModel}
              index={index}
              onPress={expand => this.openNews(item, expand)}
            />
        }
        keyExtractor={(item: IFlashMessageModel | INewsModel) => item.id.toString()}
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
    const { fetchFailed, availableApps, navigation, authorizedActions, publishableBlogs, flashMessages, isFetching } = this.props;
    const canCreateBlog = authorizedActions && authorizedActions.some(action => action.displayName === "blog.create");
    let buttonMenuItems = [];
    if (publishableBlogs.length > 0 || canCreateBlog) {
      buttonMenuItems.push({text: I18n.t('createPost-menu-blog'), icon: "bullhorn" });
    }
    // if (false) {
    //   buttonMenuItems.push({text: I18n.t("createPost-menu-news"), icon: "newspaper", id: "AddFolder"})
    // }
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
    const flashMessagesData = flashMessages && flashMessages.data && flashMessages.data.map(flashMessage => ({ ...flashMessage, type: "FLASHMESSAGE"}));
    const timelineData = flashMessagesData ? flashMessagesData.concat(news) : news;
    const isEmpty = timelineData && !timelineData.length;

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
        <Notifier id="timeline" style={{ marginRight: 40 }} />
        {isFetching && isEmpty ? this.renderLoading() : this.renderList(timelineData as Array<IFlashMessageModel | INewsModel>)}
        {buttonMenuItems.length > 0 ?
          <TempFloatingAction
            iconName="new_post"
            menuItems={buttonMenuItems}
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

const ConnectedTimeline = connect(
  (state: any) => ({
    ...state.timeline,
    isAuthenticated: state.user.auth.loggedIn,
    legalapps: state.user.auth.apps,
    authorizedActions: state.user.info.authorizedActions,
    publishableBlogs: state.timeline.publishableBlogs.data,
  }),
  (dispatch: ThunkDispatch<any, any, any>) => ({
    fetch: availableApps => fetchTimeline(dispatch)(availableApps),
    fetchFlashMessages: () => dispatch(fetchFlashMessagesAction()),
    dismissFlashMessage: (flashMessageId: string) => dispatch(markFlashMessageAsReadAction(flashMessageId)),
    sync: (page: number, availableApps, legalapps) =>
      listTimeline(dispatch)(page, availableApps, legalapps),
    onMount: () => {
      dispatch(fetchPublishableBlogsAction(true));
      dispatch(fetchFlashMessagesAction());
    }
  })
)(Timeline);

export default withViewTracking("timeline")(ConnectedTimeline);
