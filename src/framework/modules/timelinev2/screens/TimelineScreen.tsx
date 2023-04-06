import { NavigationState } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, ListRenderItemInfo, RefreshControl, View } from 'react-native';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { cardPaddingMerging } from '~/framework/components/card/base';
import { UI_ANIMATIONS, UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import PopupMenu from '~/framework/components/menus/popup';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView, pageGutterSize } from '~/framework/components/page';
import SwipeableList from '~/framework/components/swipeableList';
import { SmallText } from '~/framework/components/text';
import { ISession } from '~/framework/modules/auth/model';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import {
  dismissFlashMessageAction,
  loadNotificationsPageAction,
  startLoadNotificationsAction,
} from '~/framework/modules/timelinev2/actions';
import { TimelineFlashMessage } from '~/framework/modules/timelinev2/components/TimelineFlashMessage';
import { TimelineNotification } from '~/framework/modules/timelinev2/components/TimelineNotification';
import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { ITimelineNavigationParams, timelineRouteNames } from '~/framework/modules/timelinev2/navigation';
import { IEntcoreFlashMessage, IFlashMessages_State_Data } from '~/framework/modules/timelinev2/reducer/flashMessages';
import { INotifications_State } from '~/framework/modules/timelinev2/reducer/notifications';
import { getTimelineWorkflowInformation } from '~/framework/modules/timelinev2/rights';
import { notificationsService } from '~/framework/modules/timelinev2/service';
import { getTimelineWorkflows } from '~/framework/modules/timelinev2/timelineModules';
import { navigate } from '~/framework/navigation/helper';
import { navBarOptions } from '~/framework/navigation/navBar';
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

// TYPES ==========================================================================================

export interface ITimelineScreenDataProps {
  flashMessages: IFlashMessages_State_Data;
  notifications: INotifications_State;
  session: ISession;
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
  NativeStackScreenProps<ITimelineNavigationParams, 'Home'>;

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

const getTimelineItems = (flashMessages: IFlashMessages_State_Data, notifications: INotifications_State) => {
  const msgs = flashMessages ?? [];
  const notifs = notifications && notifications.data ? notifications.data : [];
  const ret = [] as (ITimelineItem & { key: string })[];
  for (const fm of msgs) {
    if (!fm.dismiss) {
      ret.push({ type: ITimelineItemType.FLASHMSG, data: fm, key: fm.id.toString() });
    }
  }
  for (const n of notifs) {
    ret.push({ type: ITimelineItemType.NOTIFICATION, data: n, key: n.id });
  }
  return ret;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<ITimelineNavigationParams, typeof timelineRouteNames.Home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('timeline.appName'),
  }),
  headerLeft: () => (
    <NavBarAction
      icon="ui-filter"
      onPress={() => {
        navigate(timelineRouteNames.Filters);
      }}
    />
  ),
});

// COMPONENT ======================================================================================

export class TimelineScreen extends React.PureComponent<ITimelineScreenProps, ITimelineScreenState> {
  // DECLARATIONS =================================================================================

  state: ITimelineScreenState = {
    loadingState: TimelineLoadingState.PRISTINE,
  };

  rights = getTimelineWorkflowInformation(this.props.session);

  // RENDER =======================================================================================

  render() {
    return (
      <>
        <PageView>
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

  renderError() {
    return (
      <SmallText>{`Error: ${this.props.notifications.error?.name}
    ${this.props.notifications.error?.name}`}</SmallText>
    ); // ToDo: great error screen here
  }

  renderList() {
    const items = getTimelineItems(this.props.flashMessages, this.props.notifications);
    const isEmpty = items && items.length === 0;

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
                        } catch {
                          /* empty */
                        } // Do nothing, just to prevent error
                      },
                      actionColor: theme.palette.status.warning.regular,
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
                        } catch {
                          /* empty */
                        } // Do nothing, just to prevent error
                      },
                      actionColor: theme.palette.status.failure.regular,
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
    const { navigation, route } = this.props;
    const reloadWithNewSettings = route.params.reloadWithNewSettings;
    if (navigation.isFocused !== prevProps.isFocused && reloadWithNewSettings) {
      this.doInit();
      navigation.setParams({ reloadWithNewSettings: undefined });
    }

    let workflows;
    if (getTimelineWorkflows(this.props.session)) {
      workflows = getTimelineWorkflows(this.props.session);
    }
    if (workflows.length) {
      this.props.navigation.setOptions({
        // eslint-disable-next-line react/no-unstable-nested-components
        headerRight: () => (
          <PopupMenu actions={workflows}>
            <NavBarAction icon="ui-plus" />
          </PopupMenu>
        ),
      });
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
    const fallbackHandleNotificationAction: NotifHandlerThunkAction = nn => async (dispatch, getState) => {
      if (isResourceUriNotification(nn)) openUrl((nn as IResourceUriNotification).resource.uri);
      return { managed: 1 };
    };
    if (this.props.handleOpenNotification)
      this.props.handleOpenNotification(n, fallbackHandleNotificationAction, this.props.navigation.getState());
  }

  async doDismissFlashMessage(flashMessageId: number) {
    await this.props.handleDismissFlashMessage(flashMessageId);
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
              Toast.showSuccess(I18n.t('timeline.reportAction.success'), { ...UI_ANIMATIONS.toast });
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
  const ts = moduleConfig.getState(s);
  const session = getAuthState(s).session;
  if (session === undefined) throw new Error('TimelineScreen : session not defined');
  return {
    flashMessages: ts.flashMessages.data,
    notifications: ts.notifications,
    session,
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
    return dispatch(loadNotificationsPageAction()) as unknown as Promise<boolean>;
  }, // TS BUG: await is needed here and type is correct
  handleDismissFlashMessage: async (flashMessageId: number) => {
    try {
      await dispatch(dismissFlashMessageAction(flashMessageId));
    } catch {
      Toast.show(I18n.t('timeline-flash-message-dismiss-error-text'));
    }
  },
  handleOpenNotification: async (n: IAbstractNotification, fallback: NotifHandlerThunkAction, navState: NavigationState) => {
    dispatch(handleNotificationAction(n, defaultNotificationActionStack, 'Timeline Notification', navState));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TimelineScreen);
