import I18n from "i18n-js";
import * as React from "react";
import { Alert, FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { NavigationInjectedProps, NavigationFocusInjectedProps, withNavigationFocus, NavigationEvents } from "react-navigation";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import Snow from "react-native-snow-bg";

import type { IGlobalState } from "~/AppStore";
import PopupMenu from "~/framework/components/popupMenu";
import { EmptyScreen } from "~/framework/components/emptyScreen";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "~/framework/components/header";
import { LoadingIndicator } from "~/framework/components/loading";
import { PageView } from "~/framework/components/page";
import { Text } from "~/framework/components/text";
import { ITimelineNotification, IResourceUriNotification, isResourceUriNotification, IAbstractNotification } from "~/framework/util/notifications";
import { defaultNotificationActionStack, handleNotificationAction, NotifHandlerThunkAction } from "~/framework/util/notifications/routing";
import { getUserSession, IUserSession } from "~/framework/util/session";

import { dismissFlashMessageAction, loadNotificationsPageAction, startLoadNotificationsAction } from "../actions";
import { TimelineFlashMessage } from "../components/TimelineFlashMessage";
import { TimelineNotification } from "../components/TimelineNotification";
import moduleConfig from "../moduleConfig";
import type { ITimeline_State } from "../reducer";
import { IEntcoreFlashMessage, IFlashMessages_State } from "../reducer/flashMessages";
import { INotifications_State } from "../reducer/notifications";
import { getTimelineWorkflows } from "../timelineModules";
import SwipeableList, { SwipeableList as SwipeableListHandle } from "../../../components/swipeableList";
import { Icon } from "../../../components/icon";
import theme from "../../../util/theme";
import { notificationsService } from "../service";
import { getTimelineWorkflowInformation } from "../rights";
import Toast from "react-native-tiny-toast";

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
  isSnowing: boolean;
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
    loadingState: TimelineLoadingState.PRISTINE,
    isSnowing: true
  }

  popupMenuRef = React.createRef<PopupMenu>();
  listRef = React.createRef<SwipeableListHandle<ITimelineItem>>();
  rights = getTimelineWorkflowInformation(this.props.session);

  // RENDER =======================================================================================

  render() {
    const { navigation } = this.props;
    const { isSnowing } = this.state;
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
      {isSnowing
        ? <Snow
            pointerEvents="none"
            fallSpeed="medium"
            snowflakesCount={100}
            fullScreen
          />
        : null
      }
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
    return <PopupMenu iconName="new_post" options={workflows} ref={this.popupMenuRef} onPress={() => {
      this.listRef.current?.recenter();
    }} />
  }

  renderError() {
    return <Text>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</Text> // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.flashMessages, this.props.notifications);
    const isEmpty = items && items.length === 0;

    const renderSwipeButton = (action, actionIcon, actionText) => [
      <View style={{ height: "100%", justifyContent: 'center' }}>
        <TouchableOpacity
          onPress={action}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            width: 140
          }}>
            <Icon name={actionIcon} size={16} color={theme.color.warning} />
            <Text style={{ color: theme.color.warning, marginLeft: 10 }}>{actionText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    ];

    return (
      <SwipeableList
        ref={this.listRef}
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
        // Swipeable props
        rightButtonWidth={140}
        itemSwipeableProps={({ item }) => {
          return ({
            rightButtons: this.rights.notification.report ? [renderSwipeButton(
              async () => {
                await this.doReportConfirm(item.data as ITimelineNotification);
                this.listRef.current?.recenter();
              }, 'warning', I18n.t('timeline.reportAction.button')
            )] : undefined,
            // onSwipeStart: () => { console.log("top onSwipeStart", item.data.id) },
            // onSwipeRelease: () => { console.log("top onSwipeRelease", item.data.id) }
          });
        }}
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
      this.setState({ isSnowing: false })
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
    this.listRef.current?.recenter();
    this.props.navigation.navigate('timeline/filters');
  }

  doReportConfirm(notif: ITimelineNotification) {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.rights.notification.report) reject(this.rights.notification.report);
      Alert.alert(
        I18n.t('timeline.reportAction.title'),
        I18n.t('timeline.reportAction.description'),
        [
          {
            text: I18n.t('timeline.reportAction.submit'),
            onPress: async () => {
              try {
                await notificationsService.report(this.props.session, notif.id);
                resolve(true);
                Toast.showSuccess(I18n.t('timeline.reportAction.success'));
              } catch (e) {
                Alert.alert(I18n.t('common.error.text'));
                reject(e);
              }
            },
            style: "destructive",
          },
          {
            text: I18n.t('common.cancel'),
            onPress: () => { resolve(false) },
            style: "cancel",
          }
        ]
      );
    });
  }
}

// UTILS ==========================================================================================

const getTimelineItems = (flashMessages: IFlashMessages_State, notifications: INotifications_State) => {
  const msgs = (flashMessages && flashMessages.data) ? flashMessages.data : [];
  const notifs = (notifications && notifications.data) ? notifications.data : [];
  return ([
    ...msgs.map(fm => ({ type: ITimelineItemType.FLASHMSG, data: fm })),
    ...notifs.map(n => ({ type: ITimelineItemType.NOTIFICATION, data: n })),
  ]);
}


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
