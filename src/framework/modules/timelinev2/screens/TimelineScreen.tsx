import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import I18n from "i18n-js";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { RefreshControl, View } from "react-native";

import type { IGlobalState } from "../../../../AppStore";
import type { ITimeline_State } from "../reducer";

import { PageContainer } from "../../../../ui/ContainerContent";
import { FakeHeader, HeaderAction, HeaderIcon, HeaderRow, HeaderTitle } from "../../../components/header";
import { Text } from "../../../components/text";
import { loadNotificationsPageAction, startLoadNotificationsAction } from "../actions";
import withViewTracking from "../../../tracker/withViewTracking";
import moduleConfig from "../moduleConfig";
import { INotification, INotifications_State, IResourceUriNotification, isResourceUriNotification } from "../reducer/notifications";
import { LoadingIndicator } from "../../../components/loading";

// TYPES ==========================================================================================

export interface ITimelineScreenDataProps {
  notifications: INotifications_State;
};
export interface ITimelineScreenEventProps {
  handleInitTimeline(): Promise<void>,
  handleNextPage(): Promise<boolean> // return true if page if there is more pages to load
};
export type ITimelineScreenProps = ITimelineScreenDataProps & ITimelineScreenEventProps & NavigationInjectedProps;

export enum TimelineLoadingState {
  PRISTINE, INIT, REFRESH, DONE
}
export interface ITimelineScreenState {
  loadingState: TimelineLoadingState; // Holds the initial loading state. further oage loading is handled by async.isFetching
};

export enum ITimelineItemType {
  NOTIFICATION, FLASHMSG
}
export interface ITimelineItem {
  type: ITimelineItemType,
  data: INotification // ToDo: Add flash message type here
}

// COMPONENT ======================================================================================

export class TimelineScreen extends React.PureComponent<
  ITimelineScreenProps,
  ITimelineScreenState
  > {

  // DECLARATIONS =================================================================================

  static navigationOptions = {
    header: () => null, // Header is included in screen
  }

  state: ITimelineScreenState = {
    loadingState: TimelineLoadingState.PRISTINE
  }

  // RENDER =======================================================================================

  render() {
    return <>
      {this.renderHeader()}
      <PageContainer>
        {[TimelineLoadingState.PRISTINE, TimelineLoadingState.INIT].includes(this.state.loadingState)
          ? <LoadingIndicator />
          : this.props.notifications.error && !this.props.notifications.lastSuccess
            ? this.renderError()
            : this.renderList()
        }
      </PageContainer>
    </>;
  }

  renderHeader() {
    const { navigation } = this.props;
    return <FakeHeader>
      <HeaderRow>
        <HeaderAction iconName="filter" onPress={() => { this.goToFilters(); }} />
        <HeaderTitle>{I18n.t("timeline.appName")}</HeaderTitle>
        <HeaderIcon name={null} />
      </HeaderRow>
    </FakeHeader>
  }

  renderError() {
    return <Text>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</Text> // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.notifications);
    return <FlatList
      // data
      data={items}
      keyExtractor={n => n.data.id.toString()}
      renderItem={({ item, index }) => item.type === ITimelineItemType.NOTIFICATION
        ? this.renderNotificationItem(item.data as INotification)
        : /*this.renderFlashMsgItem(item.data) as IFlashMessage*/ null}
      // pagination
      ListEmptyComponent={this.renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={[TimelineLoadingState.REFRESH, TimelineLoadingState.INIT].includes(this.state.loadingState)}
          onRefresh={() => this.doRefresh()}
        />
      }
      ListFooterComponent={
        this.state.loadingState === TimelineLoadingState.DONE && this.props.notifications.isFetching
          ? <LoadingIndicator /> : null
      }
      onEndReached={() => this.doNextPage()}
      onEndReachedThreshold={0.5}
    />;
  }

  renderEmpty() {
    return <Text>Empty.</Text> // ToDo: great empty screen here
  }

  renderNotificationItem(n: INotification) {
    const compInst = <Text>{n.message}</Text>;
    return isResourceUriNotification(n)
      ? <TouchableOpacity onPress={e => { this.doOpenNotification(n) }} >{compInst}</TouchableOpacity>
      : <View>{compInst}</View>;
  }

  renderFlashMsgItem(fm: any) { // ToDo type and code
  }

  // LIFECYCLE ====================================================================================

  constructor(props: ITimelineScreenProps) {
    super(props);
    this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    try {
      this.setState({ loadingState: TimelineLoadingState.INIT });
      await this.props.handleInitTimeline();
    } finally {
      this.setState({ loadingState: TimelineLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: TimelineLoadingState.REFRESH });
      await this.props.handleInitTimeline();
    } finally {
      this.setState({ loadingState: TimelineLoadingState.DONE });
    }
  }

  async doNextPage() {
    await this.props.handleNextPage();
  }

  async doOpenNotification(n: INotification) {
    isResourceUriNotification(n) && this.props.navigation.navigate('timeline/goto', {
      notification: n as IResourceUriNotification
    })
  }

  goToFilters() { this.props.navigation.navigate('timeline/filters'); }
}

// UTILS ==========================================================================================

const getTimelineItems = (notifications: INotifications_State /* add flash messages param here */) =>
([
  ...notifications.data.map(n => ({ type: ITimelineItemType.NOTIFICATION, data: n })),
  // ToDo: add array map for flash msgs
]);

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineScreenDataProps = (s) => {
  let ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    notifications: ts.notifications
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ITimelineScreenEventProps
  = (dispatch, getState) => ({
    handleInitTimeline: async () => { await dispatch(startLoadNotificationsAction()) },
    handleNextPage: async () => { await dispatch(loadNotificationsPageAction()); } // TS BUG: await is needed here and type is correct
  })

const TimelineScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
export default withViewTracking("timeline")(TimelineScreen_Connected);
