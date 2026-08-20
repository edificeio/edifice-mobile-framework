import * as React from 'react';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { NotificationList } from '~/framework/modules/home/components';
import { getUserbookAuthor } from '~/framework/modules/home/components/notification/util';
import { useHomeReload, useRefresh } from '~/framework/modules/home/hooks';
import { loadNotificationsPageAction, startLoadNotificationsAction } from '~/framework/modules/timeline/actions';
import timelineConfig from '~/framework/modules/timeline/module-config';
import { userRouteNames } from '~/framework/modules/user/navigation';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

// ToDo: bring back the badge of the unread count once the back exposes.
export const HomeNotificationsScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-notifications',
  title: I18n.get('home-notifications-title'),
});

export function HomeNotificationsScreen() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const notifications = useSelector(state => timelineConfig.getState(state).notifications);

  const onEndReached = React.useCallback(() => {
    if (!notifications.endReached) dispatch(loadNotificationsPageAction());
  }, [dispatch, notifications.endReached]);

  const reload = React.useCallback(() => dispatch(startLoadNotificationsAction()), [dispatch]);

  const reloading = useHomeReload(reload);

  const { onRefresh, refreshing } = useRefresh(reload);

  const onPressItem = React.useCallback(
    (notification: ITimelineNotification) => {
      const author = getUserbookAuthor(notification);
      if (author) return navigation.navigate(userRouteNames.profile, { userId: author });

      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          navigation,
          navigation.dispatch,
          'Home Notification',
          false,
        ),
      );
    },
    [dispatch, navigation],
  );

  return (
    <NotificationList
      notifications={notifications.data}
      loading={notifications.isPristine || reloading}
      loadingMore={notifications.isFetching && !notifications.isPristine && !refreshing && !reloading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onPressItem={onPressItem}
    />
  );
}
