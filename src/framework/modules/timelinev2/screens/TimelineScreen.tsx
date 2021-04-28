import * as React from "react";
import { NavigationInjectedProps, NavigationFocusInjectedProps, withNavigationFocus } from "react-navigation";
import I18n from "i18n-js";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { RefreshControl } from "react-native";

import type { IGlobalState } from "../../../../AppStore";
import type { ITimeline_State } from "../reducer";

import { PageContainer } from "../../../../ui/ContainerContent";
import { FakeHeader, HeaderAction, HeaderIcon, HeaderRow, HeaderTitle } from "../../../components/header";
import { Text } from "../../../components/text";
import { dismissFlashMessageAction, loadNotificationsPageAction, startLoadNotificationsAction } from "../actions";
import withViewTracking from "../../../tracker/withViewTracking";
import moduleConfig from "../moduleConfig";
import { INotifications_State } from "../reducer/notifications";
import { IEntcoreFlashMessage, IFlashMessages_State } from "../reducer/flashMessages";
import { LoadingIndicator } from "../../../components/loading";
import { TimelineNotification } from "../components/TimelineNotification";
import { TimelineFlashMessage } from "../components/TimelineFlashMessage";
import { INotification, IResourceUriNotification, isResourceUriNotification } from "../../../notifications";

// TYPES ==========================================================================================

export interface ITimelineScreenDataProps {
  flashMessages: IFlashMessages_State;
  notifications: INotifications_State;
};
export interface ITimelineScreenEventProps {
  handleInitTimeline(): Promise<void>,
  handleNextPage(): Promise<boolean>, // return true if page if there is more pages to load
  handleDismissFlashMessage(flashMessageId: number): Promise<void>
};
export type ITimelineScreenProps = ITimelineScreenDataProps
  & ITimelineScreenEventProps
  & NavigationInjectedProps
  & NavigationFocusInjectedProps;

export enum TimelineLoadingState {
  PRISTINE, INIT, REFRESH, DONE
}
export interface ITimelineScreenState {
  loadingState: TimelineLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
};

export enum ITimelineItemType {
  NOTIFICATION, FLASHMSG
}
export interface ITimelineItem {
  type: ITimelineItemType,
  data: INotification | IEntcoreFlashMessage
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
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderAction iconName="filter" onPress={() => { this.goToFilters(); }} />
          <HeaderTitle>{I18n.t("timeline.appName")}</HeaderTitle>
          <HeaderIcon name={null} />
        </HeaderRow>
      </FakeHeader>
    )
  }

  renderError() {
    return <Text>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</Text> // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.flashMessages, this.props.notifications);
    return (
      <FlatList
        // data
        data={items}
        keyExtractor={n => n.data.id.toString()}
        renderItem={({ item }) => item.type === ITimelineItemType.NOTIFICATION
          ? this.renderNotificationItem(item.data as INotification)
          : this.renderFlashMessageItem(item.data as IEntcoreFlashMessage)}
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
      />
    );
  }

  renderEmpty() {
    return <Text>Empty.</Text> // ToDo: great empty screen here
  }

  renderNotificationItem(notification: INotification) {
    return (
      <TimelineNotification
        notification={notification}
        notificationAction={
          isResourceUriNotification(notification)
            ? () => this.doOpenNotification(notification)
            : undefined
        }
      />
    )
  }

  renderFlashMessageItem(flashMessage: IEntcoreFlashMessage) {
    return (
      <TimelineFlashMessage
        flashMessage={flashMessage}
        flashMessageAction={() => this.doDismissFlashMessage(flashMessage.id)}
      />
    )
  }

  // LIFECYCLE ====================================================================================

  constructor(props: ITimelineScreenProps) {
    super(props);
    this.doInit();
  }

  componentDidUpdate(prevProps) {
    const { navigation, isFocused } = this.props;
    const reloadWithNewSettings = navigation.getParam("reloadWithNewSettings");
    if (isFocused !== prevProps.isFocused && reloadWithNewSettings) {
      this.doInit();
      navigation.setParams({reloadWithNewSettings: undefined});
    }
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
    if (!this.props.notifications.endReached)
      await this.props.handleNextPage();
  }

  async doOpenNotification(n: INotification) {
    isResourceUriNotification(n) && this.props.navigation.navigate('timeline/goto', {
      notification: n as IResourceUriNotification
    })
  }

  async doDismissFlashMessage(flashMessageId: number) {
    await this.props.handleDismissFlashMessage(flashMessageId);
  }

  goToFilters() { this.props.navigation.navigate('timeline/filters'); }
}

// UTILS ==========================================================================================

const getTimelineItems = (flashMessages: IFlashMessages_State, notifications: INotifications_State) =>
([
  ...flashMessages.data.map(fm => ({ type: ITimelineItemType.FLASHMSG, data: fm })),
  ...notifications.data.map(n => ({ type: ITimelineItemType.NOTIFICATION, data: n })),
]);

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineScreenDataProps = (s) => {
  let ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    flashMessages: ts.flashMessages,
    notifications: ts.notifications
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ITimelineScreenEventProps
  = (dispatch, getState) => ({
    handleInitTimeline: async () => { await dispatch(startLoadNotificationsAction()) },
    handleNextPage: async () => { await dispatch(loadNotificationsPageAction()); }, // TS BUG: await is needed here and type is correct
    handleDismissFlashMessage: async (flashMessageId: number) => { await dispatch(dismissFlashMessageAction(flashMessageId)); }
  })

const TimelineScreen_withNavigationFocus = withNavigationFocus(TimelineScreen);
const TimelineScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(TimelineScreen_withNavigationFocus);
export default withViewTracking("timeline")(TimelineScreen_Connected);
