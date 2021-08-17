import I18n from "i18n-js";
import * as React from "react";
import { RefreshControl, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { NavigationInjectedProps, NavigationFocusInjectedProps, withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import type { IGlobalState } from "../../../../AppStore";
import PopupMenu from "../../../../framework/components/popupMenu";
import { EmptyScreen } from "../../../components/emptyScreen";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "../../../components/header";
import { LoadingIndicator } from "../../../components/loading";
import { PageView } from "../../../components/page";
import { Text } from "../../../components/text";
import { ITimelineNotification, IResourceUriNotification, isResourceUriNotification, IAbstractNotification, getAsResourceUriNotification } from "../../../util/notifications";
import { defaultNotificationActionStack, handleNotificationAction, NotifHandlerThunkAction } from "../../../util/notifications/routing";
import { getUserSession, IUserSession } from "../../../util/session";
import { dismissFlashMessageAction, loadNotificationsPageAction, startLoadNotificationsAction } from "../actions";
import { TimelineFlashMessage } from "../components/TimelineFlashMessage";
import { TimelineNotification } from "../components/TimelineNotification";
import moduleConfig from "../moduleConfig";
import type { ITimeline_State } from "../reducer";
import { IEntcoreFlashMessage, IFlashMessages_State } from "../reducer/flashMessages";
import { INotifications_State } from "../reducer/notifications";
import { getTimelineWorkflows } from "../timelineModules";

// TYPES ==========================================================================================

export interface ITimelineScreenDataProps {
  flashMessages: IFlashMessages_State;
  notifications: INotifications_State;
  session: IUserSession;
};
export interface ITimelineScreenEventProps {
  dispatch: ThunkDispatch<any, any, any>
  handleInitTimeline(): Promise<void>,
  handleNextPage(): Promise<boolean>, // return true if page if there is more pages to load
  handleDismissFlashMessage(flashMessageId: number): Promise<void>
  handleOpenNotification(n: IAbstractNotification, fallback: NotifHandlerThunkAction): Promise<void>
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
  data: ITimelineNotification | IEntcoreFlashMessage
}

// COMPONENT ======================================================================================

export class TimelineScreen extends React.PureComponent<
  ITimelineScreenProps,
  ITimelineScreenState
> {

  // DECLARATIONS =================================================================================

  state: ITimelineScreenState = {
    loadingState: TimelineLoadingState.PRISTINE
  }

  popupMenuRef = React.createRef<PopupMenu>();

  // RENDER =======================================================================================

  render() {
    const { navigation } = this.props;
    const routeName = navigation.state.routeName;
    return <>
      {this.renderHeader()}
      {this.renderHeaderButton()}
      <PageView path={routeName}>
        {[TimelineLoadingState.PRISTINE, TimelineLoadingState.INIT].includes(this.state.loadingState)
          ? <LoadingIndicator />
          : this.props.notifications.error && !this.props.notifications.lastSuccess
            ? this.renderError()
            : this.renderList()
        }
      </PageView>
    </>;
  }

  renderHeader() {
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction
              iconName="filter"
              onPress={() => this.goToFilters()}
            />
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle>{I18n.t("timeline.appName")}</HeaderTitle>
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    )
  }

  renderHeaderButton() {
    const workflows = getTimelineWorkflows(this.props.session);
    if (!workflows || !workflows.length) return null;
    return <PopupMenu iconName="new_post" options={workflows} ref={this.popupMenuRef} />
  }

  renderError() {
    return <Text>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</Text> // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.flashMessages, this.props.notifications);
    const isEmpty = items && items.length === 0;
    return (
      <FlatList
        // data
        data={items}
        keyExtractor={n => n?.data?.id?.toString()}
        contentContainerStyle={isEmpty ? { flex: 1 } : null}
        renderItem={({ item }) => item.type === ITimelineItemType.NOTIFICATION
          ? this.renderNotificationItem(item.data as ITimelineNotification)
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
        ListHeaderComponent={
          getTimelineWorkflows(this.props.session).length ? <View style={{ height: 12 }} /> : null
        }
        onEndReached={() => this.doNextPage()}
        onEndReachedThreshold={0.5}
      />
    );
  }

  renderEmpty() {
    return (
      <EmptyScreen
        imageSrc={require("../../../../../assets/images/empty-screen/timeline.png")}
        imgWidth={407}
        imgHeight={319}
        title={I18n.t("timeline.emptyScreenTitle")}
        text={I18n.t("timeline.emptyScreenText")}
      />
    );
  }

  renderNotificationItem(notification: ITimelineNotification) {
    return (
      <TimelineNotification
        notification={notification}
        notificationAction={
          isResourceUriNotification(notification)
            ? () => this.doOpenNotification(notification as ITimelineNotification & IResourceUriNotification)
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

  componentDidMount() {
    this.doInit();
  }

  componentDidUpdate(prevProps) {
    const { navigation, isFocused } = this.props;
    const reloadWithNewSettings = navigation.getParam("reloadWithNewSettings");
    if (isFocused !== prevProps.isFocused && reloadWithNewSettings) {
      this.doInit();
      navigation.setParams({ reloadWithNewSettings: undefined });
    }
    if (isFocused !== prevProps.isFocused) {
      this.popupMenuRef.current?.doReset();
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

  async doOpenNotification(n: IResourceUriNotification) {
    const fallbackHandleNotificationAction: NotifHandlerThunkAction = n => async (dispatch, getState) => {
      isResourceUriNotification(n) && this.props.navigation.navigate('timeline/goto', {
        notification: n as IResourceUriNotification
      })
      return { managed: 1 };
    };
    this.props.handleOpenNotification && this.props.handleOpenNotification(n, fallbackHandleNotificationAction);
  }

  async doDismissFlashMessage(flashMessageId: number) {
    await this.props.handleDismissFlashMessage(flashMessageId);
  }

  goToFilters() {
    this.props.navigation.navigate('timeline/filters');
  }
}

// UTILS ==========================================================================================

const getTimelineItems = (flashMessages: IFlashMessages_State, notifications: INotifications_State) =>
([
  ...flashMessages && flashMessages.data && flashMessages.data.map(fm => ({ type: ITimelineItemType.FLASHMSG, data: fm })),
  ...notifications && notifications.data && notifications.data.map(n => ({ type: ITimelineItemType.NOTIFICATION, data: n })),
]);

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineScreenDataProps = (s) => {
  let ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    flashMessages: ts.flashMessages,
    notifications: ts.notifications,
    session: getUserSession(s)
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ITimelineScreenEventProps
  = (dispatch, getState) => ({
    dispatch,
    handleInitTimeline: async () => { await dispatch(startLoadNotificationsAction()) },
    handleNextPage: async () => { return await (dispatch(loadNotificationsPageAction()) as unknown as Promise<boolean>); }, // TS BUG: await is needed here and type is correct
    handleDismissFlashMessage: async (flashMessageId: number) => { await dispatch(dismissFlashMessageAction(flashMessageId)); },
    handleOpenNotification: async (n: IAbstractNotification) => {
      dispatch(handleNotificationAction(n, defaultNotificationActionStack, "Timeline Notification"))
    }
  })

const TimelineScreen_withNavigationFocus = withNavigationFocus(TimelineScreen);
const TimelineScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(TimelineScreen_withNavigationFocus);
export default TimelineScreen_Connected;
