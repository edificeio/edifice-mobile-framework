import * as React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { NotificationCard } from '~/framework/modules/home/components/notification/card';
import {
  NotificationsPlaceholder,
  PLACEHOLDER_NEXT_PAGE_CARDS,
} from '~/framework/modules/home/components/notification/placeholder';
import { isResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';

import { getUserbookAuthor } from '../util';
import styles from './styles';
import { NotificationListProps } from './types';

const keyExtractor = (item: ITimelineNotification) => item.id;

const renderEmpty = () => (
  <EmptyScreen
    svgImage="empty-timeline"
    title={I18n.get('timeline-emptyscreen-title')}
    text={I18n.get('timeline-emptyscreen-text')}
  />
);

export const NotificationList = React.memo(
  ({ loading, loadingMore, notifications, onEndReached, onPressItem, onRefresh, refreshing }: NotificationListProps) => {
    const refreshControl = React.useMemo(
      () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
      [onRefresh, refreshing],
    );

    const renderItem = React.useCallback(
      ({ item }: ListRenderItemInfo<ITimelineNotification>) => (
        // A mood or a motto has no resource, but opens the profile of its author.
        <NotificationCard
          notification={item}
          onPress={isResourceUriNotification(item) || getUserbookAuthor(item) ? () => onPressItem(item) : undefined}
        />
      ),
      [onPressItem],
    );

    const busy = loading || refreshing;

    return (
      <FlatList
        data={busy ? undefined : notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={busy || notifications.length ? undefined : styles.empty}
        ListEmptyComponent={busy ? <NotificationsPlaceholder preview /> : renderEmpty}
        ListFooterComponent={loadingMore ? <NotificationsPlaceholder count={PLACEHOLDER_NEXT_PAGE_CARDS} /> : null}
        refreshControl={refreshControl}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
      />
    );
  },
);
