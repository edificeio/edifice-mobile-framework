import * as React from 'react';
import { Alert } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import Toast from '~/framework/components/toast';
import { withSession } from '~/framework/modules/auth/util';
import { NotificationList } from '~/framework/modules/home/components';
import { isUserbookNotification } from '~/framework/modules/home/components/notification/util';
import { useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import {
  deleteNotificationAction,
  loadNotificationsPageAction,
  startLoadNotificationsAction,
} from '~/framework/modules/timeline/actions';
import timelineConfig from '~/framework/modules/timeline/module-config';
import { getTimelineWorkflowInformation } from '~/framework/modules/timeline/rights';
import { notificationsService } from '~/framework/modules/timeline/service';
import { userRouteNames } from '~/framework/modules/user/navigation';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

import { HomeNotificationsScreenProps } from './types';

// ToDo: bring back the badge of the unread count once the back exposes.
export const HomeNotificationsScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-notifications',
  title: I18n.get('home-notifications-title'),
});

export const HomeNotificationsScreen = withSession<HomeNotificationsScreenProps>(function ({ navigation, session }) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const navParent = navigation.getParent<NavigationProp<ParamListBase>>();

  const notifications = useSelector(state => timelineConfig.getState(state).notifications);
  const canReport = getTimelineWorkflowInformation(session).notification.report;

  const onEndReached = React.useCallback(() => {
    if (!notifications.endReached) dispatch(loadNotificationsPageAction());
  }, [dispatch, notifications.endReached]);

  const reload = React.useCallback(() => dispatch(startLoadNotificationsAction()), [dispatch]);

  const reloading = useHomeReload(reload);

  const { onRefresh, refreshing } = useRefresh(reload);

  const onPressItem = React.useCallback(
    (notification: ITimelineNotification) => {
      if (isUserbookNotification(notification)) {
        return navParent.navigate(userRouteNames.profile, { userId: notification.backupData?.sender });
      }

      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          navParent,
          navParent.dispatch,
          'Home Notification',
          false,
        ),
      );
    },
    [dispatch, navParent],
  );

  const pagerLocked = React.useRef<boolean>(false);
  const onRowSwipeActiveChange = React.useCallback(
    (active: boolean) => {
      if (pagerLocked.current === active) return;
      pagerLocked.current = active;
      navigation.setOptions({ swipeEnabled: !active } as MaterialTopTabNavigationOptions);
    },
    [navigation],
  );

  useFocusEffect(React.useCallback(() => () => onRowSwipeActiveChange(false), [onRowSwipeActiveChange]));

  const onDeleteItem = React.useCallback(
    (id: string) =>
      new Promise<void>(resolve => {
        Alert.alert(I18n.get('home-notifications-delete-title'), I18n.get('home-notifications-delete-description'), [
          {
            onPress: async () => {
              try {
                await dispatch(deleteNotificationAction(id));
              } catch {
                Toast.showError(I18n.get('timeline-error-text'));
              } finally {
                resolve();
              }
            },
            style: 'destructive',
            text: I18n.get('common-delete'),
          },
          { onPress: () => resolve(), style: 'cancel', text: I18n.get('common-cancel') },
        ]);
      }),
    [dispatch],
  );

  const onReportItem = React.useCallback(
    (notification: ITimelineNotification) =>
      new Promise<boolean>((resolve, reject) => {
        Alert.alert(
          I18n.get('timeline-reportaction-title'),
          I18n.get('timeline-reportaction-description', { appName: DeviceInfo.getApplicationName() }),
          [
            {
              onPress: async () => {
                try {
                  await notificationsService.report(notification.id);
                  Toast.showSuccess(I18n.get('timeline-reportaction-success'));
                  resolve(true);
                } catch (e) {
                  Alert.alert(I18n.get('timeline-error-text'));
                  reject(e);
                }
              },
              style: 'destructive',
              text: I18n.get('timeline-reportaction-submit'),
            },
            { onPress: () => resolve(false), style: 'cancel', text: I18n.get('common-cancel') },
          ],
        );
      }),
    [],
  );

  return (
    <NotificationList
      notifications={notifications.data}
      loading={notifications.isPristine || reloading}
      loadingMore={notifications.isFetching && !notifications.isPristine && !refreshing && !reloading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onDeleteItem={onDeleteItem}
      onPressItem={onPressItem}
      onReportItem={onReportItem}
      onSwipeActiveChange={onRowSwipeActiveChange}
      canReport={canReport}
      userId={session.user.id}
    />
  );
});
