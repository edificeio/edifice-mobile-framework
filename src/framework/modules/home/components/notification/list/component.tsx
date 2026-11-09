import * as React from 'react';
import { RefreshControl, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { SwipeableList, SwipeableListRenderItemInfo } from '~/framework/components/list/swipeable';
import { NotificationCard, UserbookNotificationCard } from '~/framework/modules/home/components/notification/card';
import {
  NotificationsPlaceholder,
  PLACEHOLDER_NEXT_PAGE_CARDS,
} from '~/framework/modules/home/components/notification/placeholder';
import { canOpenNotification, isUserbookNotification } from '~/framework/modules/home/components/notification/util';
import { ITimelineNotification } from '~/framework/util/notifications';

import styles from './styles';
import { NotificationListProps } from './types';

const keyExtractor = (item: ITimelineNotification) => item.id;

const renderSeparator = () => <View style={styles.separator} />;

const NotificationList = ({
  emptyTextsI18n,
  getSwipeActions,
  loading,
  loadingMore,
  notifications,
  onEndReached,
  onPressItem,
  onRefresh,
  onSwipeActiveChange,
  preview = false,
  refreshing,
}: Readonly<NotificationListProps>) => {
  const refreshControl = React.useMemo(
    () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
    [onRefresh, refreshing],
  );

  const shownNotifications = React.useMemo(() => notifications.filter(item => !item.deleted), [notifications]);

  const renderItem = React.useCallback(
    ({ guardPress, item }: SwipeableListRenderItemInfo<ITimelineNotification>) => {
      const onPress = guardPress(canOpenNotification(item) ? () => onPressItem(item) : undefined);
      if (isUserbookNotification(item)) return <UserbookNotificationCard notification={item} onPress={onPress} />;
      return <NotificationCard notification={item} onPress={onPress} />;
    },
    [onPressItem],
  );

  const loadingOrRefreshing = loading || refreshing;

  function renderListEmpty() {
    if (loadingOrRefreshing) return <NotificationsPlaceholder preview={preview} />;
    return <EmptyScreen svgImage="empty-timeline" title={I18n.get(emptyTextsI18n.title)} text={I18n.get(emptyTextsI18n.text)} />;
  }

  function renderListFooter() {
    if (!loadingMore) return null;
    return <NotificationsPlaceholder count={PLACEHOLDER_NEXT_PAGE_CARDS} preview={false} />;
  }

  return (
    <SwipeableList
      style={UI_STYLES.flex1}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!loadingOrRefreshing}
      data={loadingOrRefreshing ? undefined : shownNotifications}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getSwipeActions={getSwipeActions}
      onSwipeActiveChange={onSwipeActiveChange}
      ItemSeparatorComponent={loadingOrRefreshing ? undefined : renderSeparator}
      contentContainerStyle={loadingOrRefreshing || shownNotifications.length ? UI_STYLES.flexGrow1 : UI_STYLES.flex1}
      ListEmptyComponent={renderListEmpty()}
      ListFooterComponent={renderListFooter()}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={1}
    />
  );
};

export default React.memo(NotificationList);
