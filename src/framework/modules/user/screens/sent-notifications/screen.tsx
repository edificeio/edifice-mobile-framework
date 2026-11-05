import * as React from 'react';
import { ListRenderItemInfo, RefreshControl, View } from 'react-native';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import Toast from '~/framework/components/toast';
import { loadAuthorizedNotifTypesAction } from '~/framework/modules/home/actions';
import {
  NotificationCard,
  NotificationsPlaceholder,
  PLACEHOLDER_NEXT_PAGE_CARDS,
  UserbookNotificationCard,
} from '~/framework/modules/home/components';
import { canOpenNotification, isUserbookNotification } from '~/framework/modules/home/components/notification/util';
import { useRefresh } from '~/framework/modules/home/hooks';
import { notificationsService } from '~/framework/modules/home/service';
import { userRouteNames } from '~/framework/modules/user/navigation';
import type { ITimelineNotification } from '~/framework/util/notifications';
import { defaultNotificationActionStack, handleNotificationAction } from '~/framework/util/notifications/routing';

import styles from './styles';
import type { UserSentNotificationsScreenPrivateProps } from './types';

// the server sends pages of 25: a shorter page is the last one.
const PAGE_SIZE = 25;

export const computeNavBar = screenOptions(() => ({
  title: I18n.get('user-sentnotifications-title'),
}));

const keyExtractor = (item: ITimelineNotification) => item.id;

const renderSeparator = () => <View style={styles.separator} />;

const renderEmpty = () => (
  <EmptyScreen
    svgImage="empty-timeline"
    title={I18n.get('user-sentnotifications-emptyscreen-title')}
    text={I18n.get('user-sentnotifications-emptyscreen-text')}
  />
);

export default function UserSentNotificationsScreen({ navigation }: UserSentNotificationsScreenPrivateProps) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const [notifications, setNotifications] = React.useState<ITimelineNotification[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingMore, setLoadingMore] = React.useState<boolean>(false);

  // kept in refs so that a page asked twice by onEndReached is only fetched once.
  const nextPage = React.useRef<number>(0);
  const endReached = React.useRef<boolean>(false);
  const fetching = React.useRef<boolean>(false);

  const fetchPage = React.useCallback(
    async (page: number) => {
      // until the sent notifications get their own filters, every type the user can see is asked.
      const types = (await dispatch(loadAuthorizedNotifTypesAction())) as unknown as string[];
      const pageNotifications = await notificationsService.sentPage(page, types);
      nextPage.current = page + 1;
      endReached.current = pageNotifications.length < PAGE_SIZE;
      return pageNotifications;
    },
    [dispatch],
  );

  const reload = React.useCallback(async () => {
    fetching.current = true;
    try {
      setNotifications(await fetchPage(0));
    } catch (e) {
      // a failed reload keeps the list already shown.
      console.error('Error while loading the sent notifications', e);
      Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      fetching.current = false;
    }
  }, [fetchPage]);

  React.useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const { onRefresh, refreshing } = useRefresh(reload);

  const onEndReached = React.useCallback(async () => {
    if (fetching.current || endReached.current || loading) return;
    fetching.current = true;
    setLoadingMore(true);
    try {
      const pageNotifications = await fetchPage(nextPage.current);
      setNotifications(current => [...current, ...pageNotifications]);
    } catch (e) {
      // the same page is asked again on the next scroll.
      console.error('Error while loading the next page of sent notifications', e);
      Toast.showError(I18n.get('timeline-error-text'));
    } finally {
      fetching.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, loading]);

  const onPressItem = React.useCallback(
    (notification: ITimelineNotification) => {
      if (isUserbookNotification(notification)) {
        return navigation.navigate(userRouteNames.profile, { userId: notification.backupData?.sender });
      }
      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          navigation,
          navigation.dispatch,
          'Sent Notification',
          false,
        ),
      );
    },
    [dispatch, navigation],
  );

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<ITimelineNotification>) => {
      const onPress = canOpenNotification(item) ? () => onPressItem(item) : undefined;
      return (
        <View style={styles.row}>
          {isUserbookNotification(item) ? (
            <UserbookNotificationCard notification={item} onPress={onPress} />
          ) : (
            <NotificationCard notification={item} onPress={onPress} />
          )}
        </View>
      );
    },
    [onPressItem],
  );

  const refreshControl = React.useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
    [onRefresh, refreshing],
  );

  const loadingOrRefreshing = loading || refreshing;

  return (
    <FlatList
      style={UI_STYLES.flex1}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!loadingOrRefreshing}
      data={loadingOrRefreshing ? undefined : notifications}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={loadingOrRefreshing ? undefined : renderSeparator}
      contentContainerStyle={UI_STYLES.flexGrow1}
      ListEmptyComponent={loadingOrRefreshing ? <NotificationsPlaceholder preview={false} /> : renderEmpty}
      ListFooterComponent={loadingMore ? <NotificationsPlaceholder count={PLACEHOLDER_NEXT_PAGE_CARDS} preview={false} /> : null}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
    />
  );
}
