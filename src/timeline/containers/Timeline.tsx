import I18n from "i18n-js";

import * as React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { connect } from "react-redux";

import { FlatButton, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import { ErrorMessage } from "../../ui/Typography";
import { News } from "../components/News";

import styles from "../../styles";
import Tracking from "../../tracking/TrackingManager";

import { clearFilterConversation } from "../../mailbox/actions/filter";
import { fetchTimeline, listTimeline } from "../actions/list";
import { INewsModel } from "../reducer";
import { standardNavScreenOptions } from "../../navigation/helpers/navHelper";
import { NavigationScreenProp } from "react-navigation";
import { HeaderAction } from "../../ui/headers/NewHeader";

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
  onFocus: () => void;
}

// tslint:disable-next-line:max-classes-per-file
class Timeline extends React.Component<ITimelineProps, undefined> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
  standardNavScreenOptions(
    {
      headerBackTitle: null,
      title: I18n.t("News"),
      headerLeft: <HeaderAction
        onPress={() => {
          navigation.navigate("filterTimeline");
        }}
        name="filter"
      />,
    },
    navigation
  );

  private flatList: any;
  private pageNumber: number = 0;

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
    this.props.onFocus();
    this.didFocusSubscription = this.props.navigation.addListener(
      "didFocus",
      payload => {
        this.props.onFocus();
        if (this.props.availableApps) this.fetchLatest();
      }
    );
  }

  private didFocusSubscription;
  public componentWillUnmount() {
    this.didFocusSubscription.remove();
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
    return (
      <FlatList
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

  public renderEmptyScreen() {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/timeline.png")}
        imgWidth={407}
        imgHeight={319}
        text={I18n.t("timeline-emptyScreenText")}
        title={I18n.t("timeline-emptyScreenTitle")}
      />
    );
  }

  public renderLoading() {
    return <Loading />;
  }

  public render() {
    const { isFetching, fetchFailed } = this.props;
    const { availableApps } = this.props;
    const availableAppsWithUppercase = {};
    if (availableApps) {
      Object.keys(availableApps).forEach(app => {
        availableAppsWithUppercase[app] = availableApps[app];
        availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
      });
    }
    let { news } = this.props;
    if (availableApps) {
      news = news.filter(n => availableAppsWithUppercase[n.type]);
    }

    if (fetchFailed) {
      return this.renderFetchFailed();
    }

    if (!isFetching && (!news || news.length === 0) && this.props.endReached) {
      return this.renderEmptyScreen();
    }

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {isFetching ? this.renderLoading() : this.renderList(news)}
      </PageContainer>
    );
  }
}

export default connect(
  (state: any) => ({
    ...state.timeline,
    isAuthenticated: state.user.auth.loggedIn,
    legalapps: state.user.auth.apps
  }),
  dispatch => ({
    fetch: availableApps => fetchTimeline(dispatch)(availableApps),
    onFocus: () => clearFilterConversation(dispatch)(),
    sync: (page: number, availableApps, legalapps) =>
      listTimeline(dispatch)(page, availableApps, legalapps)
  })
)(Timeline);
