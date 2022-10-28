import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ListRenderItemInfo, RefreshControl, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { NavigationFocusInjectedProps, NavigationInjectedProps, NavigationState, withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { cardPaddingMerging } from '~/framework/components/card';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { HeaderAction } from '~/framework/components/header';
import { Icon } from '~/framework/components/icon';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView, pageGutterSize } from '~/framework/components/page';
import PopupMenu from '~/framework/components/popupMenu';
import SwipeableList from '~/framework/components/swipeableList';
import { SmallText } from '~/framework/components/text';
import {
  dismissFlashMessageAction,
  loadNotificationsPageAction,
  startLoadNotificationsAction,
} from '~/framework/modules/timelinev2/actions';
import { TimelineFlashMessage } from '~/framework/modules/timelinev2/components/TimelineFlashMessage';
import { TimelineNotification } from '~/framework/modules/timelinev2/components/TimelineNotification';
import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import type { ITimeline_State } from '~/framework/modules/timelinev2/reducer';
import { IEntcoreFlashMessage, IFlashMessages_State } from '~/framework/modules/timelinev2/reducer/flashMessages';
import { INotifications_State } from '~/framework/modules/timelinev2/reducer/notifications';
import { getTimelineWorkflowInformation } from '~/framework/modules/timelinev2/rights';
import { notificationsService } from '~/framework/modules/timelinev2/service';
import { getTimelineWorkflows } from '~/framework/modules/timelinev2/timelineModules';
import { openUrl } from '~/framework/util/linking';
import {
  IAbstractNotification,
  IResourceUriNotification,
  ITimelineNotification,
  isResourceUriNotification,
} from '~/framework/util/notifications';
import {
  NotifHandlerThunkAction,
  defaultNotificationActionStack,
  handleNotificationAction,
} from '~/framework/util/notifications/routing';
import { IUserSession, getUserSession } from '~/framework/util/session';

// TYPES ==========================================================================================

export interface ITimelineScreenDataProps {
  flashMessages: IFlashMessages_State;
  notifications: INotifications_State;
  session: IUserSession;
}
export interface ITimelineScreenEventProps {
  dispatch: ThunkDispatch<any, any, any>;
  handleInitTimeline(): Promise<void>;
  handleNextPage(): Promise<boolean>; // return true if page if there is more pages to load
  handleDismissFlashMessage(flashMessageId: number): Promise<void>;
  handleOpenNotification(n: IAbstractNotification, fallback: NotifHandlerThunkAction, navState: NavigationState): Promise<void>;
}
export type ITimelineScreenProps = ITimelineScreenDataProps &
  ITimelineScreenEventProps &
  NavigationInjectedProps &
  NavigationFocusInjectedProps;

export enum TimelineLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  REFRESH_SILENT,
  DONE,
}
export interface ITimelineScreenState {
  loadingState: TimelineLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
}

export enum ITimelineItemType {
  NOTIFICATION,
  FLASHMSG,
}
export interface ITimelineItem {
  type: ITimelineItemType;
  data: ITimelineNotification | IEntcoreFlashMessage;
}

// UTILS ==========================================================================================

const getTimelineItems = (flashMessages: IFlashMessages_State, notifications: INotifications_State) => {
  const msgs = flashMessages && flashMessages.data ? flashMessages.data : [];
  const notifs = notifications && notifications.data ? notifications.data : [];
  const ret = [] as (ITimelineItem & { key: string })[];
  for (const fm of msgs) {
    ret.push({ type: ITimelineItemType.FLASHMSG, data: fm, key: fm.id.toString() });
  }
  for (const n of notifs) {
    ret.push({ type: ITimelineItemType.NOTIFICATION, data: n, key: n.id });
  }
  return ret;
};

// COMPONENT ======================================================================================

export class TimelineScreen extends React.PureComponent<ITimelineScreenProps, ITimelineScreenState> {
  // DECLARATIONS =================================================================================

  state: ITimelineScreenState = {
    loadingState: TimelineLoadingState.PRISTINE,
  };

  popupMenuRef = React.createRef<PopupMenu>();

  // listRef = React.createRef<SwipeableListHandle<ITimelineItem>>();

  rights = getTimelineWorkflowInformation(this.props.session);

  // RENDER =======================================================================================

  render() {
    return (
      <>
        <PageView
          navigation={this.props.navigation}
          navBar={{
            left: <HeaderAction iconName="filter" onPress={() => this.goToFilters()} />,
            title: I18n.t('timeline.appName'),
          }}
          navBarNode={this.renderHeaderButton()}>
          {[TimelineLoadingState.PRISTINE, TimelineLoadingState.INIT].includes(this.state.loadingState) ? (
            <LoadingIndicator />
          ) : this.props.notifications.error && !this.props.notifications.lastSuccess ? (
            this.renderError()
          ) : (
            this.renderList()
          )}
        </PageView>
      </>
    );
  }

  renderHeaderButton() {
    const workflows = getTimelineWorkflows(this.props.session);
    if (!workflows || !workflows.length) return null;
    return (
      <PopupMenu
        iconName="new_post"
        options={workflows}
        ref={this.popupMenuRef}
      // onPress={() => {
      // this.listRef.current?.recenter();
      // }}
      />
    );
  }

  renderError() {
    return (
      <SmallText>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</SmallText>
    ); // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.flashMessages, this.props.notifications);
    const isEmpty = items && items.length === 0;

    const renderSwipeButton = (action, actionIcon, actionText, color, key) => [
      <View style={{ height: '100%', justifyContent: 'center' }} key={`${key}${actionIcon}${actionText}`}>
        <TouchableOpacity onPress={action}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: UI_SIZES.spacing.small,
              width: 140,
            }}>
            <Icon name={actionIcon} size={16} color={color} />
            <SmallText style={{ color, marginLeft: UI_SIZES.spacing.small }}>{actionText}</SmallText>
          </View>
        </TouchableOpacity>
      </View>,
    ];

    return (
      <SwipeableList<ITimelineItem & { key: string }>
        // ref={this.listRef}
        // data
        data={items}
        keyExtractor={n => n.data.id.toString()}
        contentContainerStyle={isEmpty ? UI_STYLES.flex1 : undefined}
        renderItem={({ item }: ListRenderItemInfo<ITimelineItem>) =>
          item.type === ITimelineItemType.NOTIFICATION
            ? this.renderNotificationItem(item.data as ITimelineNotification)
            : this.renderFlashMessageItem(item.data as IEntcoreFlashMessage)
        }
        // pagination
        ListEmptyComponent={this.renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={[TimelineLoadingState.REFRESH, TimelineLoadingState.INIT].includes(this.state.loadingState)}
            onRefresh={() => this.doRefresh()}
          />
        }
        ListFooterComponent={
          this.state.loadingState === TimelineLoadingState.DONE && this.props.notifications.isFetching ? (
            <LoadingIndicator withVerticalMargins />
          ) : null
        }
        ListHeaderComponent={<View style={{ height: pageGutterSize }} />}
        onEndReached={() => this.doNextPage()}
        onEndReachedThreshold={0.5}
        // Swipeable props
        swipeActionWidth={140}
        hiddenRowStyle={cardPaddingMerging}
        hiddenItemStyle={UI_STYLES.justifyEnd}
        itemSwipeActionProps={({ item }) => {
          return {
            right: this.rights.notification.report
              ? item.type === ITimelineItemType.NOTIFICATION
                ? [
                  {
                    action: async row => {
                      try {
                        await this.doReportConfirm(item.data as ITimelineNotification);
                        row[item.data.id]?.closeRow();
                      } catch (e) { } // Do nothing, just to prevent error
                    },
                    actionColor: theme.palette.status.warning,
                    actionText: I18n.t('timeline.reportAction.button'),
                    actionIcon: 'ui-warning',
                  },
                ]
                : item.type === ITimelineItemType.FLASHMSG
                  ? [
                    {
                      action: async row => {
                        try {
                          await this.doDismissFlashMessage((item.data as IEntcoreFlashMessage).id);
                          row[item.data.id]?.closeRow();
                        } catch (e) { } // Do nothing, just to prevent error
                      },
                      actionColor: theme.palette.status.failure,
                      actionText: I18n.t('common.close'),
                      actionIcon: 'ui-close',
                    },
                  ]
                  : undefined
              : undefined,
          };
        }}
      />
    );
  }

  renderEmpty() {
    return (
      <EmptyScreen
        svgImage="empty-timeline"
        title={I18n.t('timeline.emptyScreenTitle')}
        text={I18n.t('timeline.emptyScreenText')}
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
    );
  }

  renderFlashMessageItem(flashMessage: IEntcoreFlashMessage) {
    return (
      <TimelineFlashMessage flashMessage={flashMessage} flashMessageAction={() => this.doDismissFlashMessage(flashMessage.id)} />
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  componentDidUpdate(prevProps) {
    const { navigation, isFocused } = this.props;
    const reloadWithNewSettings = navigation.getParam('reloadWithNewSettings');
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

  async doRefreshSilent() {
    try {
      this.setState({ loadingState: TimelineLoadingState.REFRESH_SILENT });
      await this.props.handleInitTimeline();
    } finally {
      this.setState({ loadingState: TimelineLoadingState.DONE });
    }
  }

  async doNextPage() {
    if (!this.props.notifications.endReached) await this.props.handleNextPage();
  }

  async doOpenNotification(n: IResourceUriNotification) {
    const fallbackHandleNotificationAction: NotifHandlerThunkAction = n => async (dispatch, getState) => {
      isResourceUriNotification(n) && openUrl((n as IResourceUriNotification).resource.uri);
      return { managed: 1 };
    };
    this.props.handleOpenNotification &&
      this.props.handleOpenNotification(n, fallbackHandleNotificationAction, this.props.navigation.state);
  }

  async doDismissFlashMessage(flashMessageId: number) {
    await this.props.handleDismissFlashMessage(flashMessageId);
    await this.doRefreshSilent();
  }

  goToFilters() {
    // this.listRef.current?.recenter();
    this.props.navigation.navigate('timeline/filters');
  }

  doReportConfirm(notif: ITimelineNotification) {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.rights.notification.report) reject(this.rights.notification.report);
      Alert.alert(I18n.t('timeline.reportAction.title'), I18n.t('timeline.reportAction.description'), [
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
          style: 'destructive',
        },
        {
          text: I18n.t('common.cancel'),
          onPress: () => {
            resolve(false);
          },
          style: 'cancel',
        },
      ]);
    });
  }
}

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ITimelineScreenDataProps = s => {
  const ts = moduleConfig.getState(s) as ITimeline_State;
  return {
    flashMessages: ts.flashMessages,
    notifications: ts.notifications,
    session: getUserSession(),
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ITimelineScreenEventProps = (
  dispatch,
  getState,
) => ({
  dispatch,
  handleInitTimeline: async () => {
    await dispatch(startLoadNotificationsAction());
  },
  handleNextPage: async () => {
    return await (dispatch(loadNotificationsPageAction()) as unknown as Promise<boolean>);
  }, // TS BUG: await is needed here and type is correct
  handleDismissFlashMessage: async (flashMessageId: number) => {
    await dispatch(dismissFlashMessageAction(flashMessageId));
  },
  handleOpenNotification: async (n: IAbstractNotification, fallback: NotifHandlerThunkAction, navState: NavigationState) => {
    dispatch(handleNotificationAction(n, defaultNotificationActionStack, 'Timeline Notification', navState));
  },
});

const TimelineScreen_withNavigationFocus = withNavigationFocus(TimelineScreen);
const TimelineScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(TimelineScreen_withNavigationFocus);
export default TimelineScreen_Connected;
