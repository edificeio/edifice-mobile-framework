import * as React from 'react';
import { ListRenderItemInfo, RefreshControl, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import {
  NotificationsPlaceholder,
  PLACEHOLDER_NEXT_PAGE_CARDS,
} from '~/framework/modules/home/components/notification/placeholder';
import { ITimelineNotification } from '~/framework/util/notifications';

import { NotificationRow } from './row';
import styles from './styles';
import { NotificationListProps } from './types';

const keyExtractor = (item: ITimelineNotification) => item.id;

const renderSeparator = () => <View style={styles.separator} />;

const renderEmpty = () => (
  <EmptyScreen
    svgImage="empty-timeline"
    title={I18n.get('timeline-emptyscreen-title')}
    text={I18n.get('timeline-emptyscreen-text')}
  />
);

export const NotificationList = React.memo(
  ({
    canReport,
    loading,
    loadingMore,
    notifications,
    onEndReached,
    onPressItem,
    onRefresh,
    onReportItem,
    onSwipeActiveChange,
    refreshing,
  }: NotificationListProps) => {
    const refreshControl = React.useMemo(
      () => <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
      [onRefresh, refreshing],
    );

    const rowRefs = React.useRef<Record<string, SwipeableMethods | null>>({});
    const openRowKey = React.useRef<string | null>(null);
    const [openRowId, setOpenRowId] = React.useState<string | null>(null);

    const setRowRef = React.useCallback((id: string, row: SwipeableMethods | null) => {
      rowRefs.current[id] = row;
    }, []);

    const closeRow = React.useCallback((id: string) => {
      rowRefs.current[id]?.close();
    }, []);

    // Only one row stays open at a time.
    const onRowWillOpen = React.useCallback(
      (id: string) => {
        const previous = openRowKey.current;
        if (previous && previous !== id) closeRow(previous);
        openRowKey.current = id;
        setOpenRowId(id);
      },
      [closeRow],
    );

    const onRowClose = React.useCallback(
      (id: string) => {
        if (openRowKey.current === id) openRowKey.current = null;
        setOpenRowId(current => (current === id ? null : current));
        onSwipeActiveChange?.(false);
      },
      [onSwipeActiveChange],
    );

    const onSwipeActive = React.useCallback((active: boolean) => onSwipeActiveChange?.(active), [onSwipeActiveChange]);

    // A tap first puts back the row left open, wherever it lands, and opens nothing.
    const onCardPress = React.useCallback(
      (item: ITimelineNotification, opens: boolean) => {
        const open = openRowKey.current;
        if (open) return closeRow(open);
        if (opens) onPressItem(item);
      },
      [closeRow, onPressItem],
    );

    const onReport = React.useCallback(
      async (item: ITimelineNotification) => {
        try {
          await onReportItem(item);
        } finally {
          closeRow(item.id);
        }
      },
      [closeRow, onReportItem],
    );

    useFocusEffect(
      React.useCallback(
        () => () => {
          if (openRowKey.current) closeRow(openRowKey.current);
        },
        [closeRow],
      ),
    );

    const renderItem = React.useCallback(
      ({ item }: ListRenderItemInfo<ITimelineNotification>) => (
        <NotificationRow
          item={item}
          canReport={canReport}
          opened={openRowId === item.id}
          someRowOpen={!!openRowId}
          onClose={onRowClose}
          onPress={onCardPress}
          onRef={setRowRef}
          onReport={onReport}
          onSwipeActive={onSwipeActive}
          onWillOpen={onRowWillOpen}
        />
      ),
      [canReport, onCardPress, onReport, onRowClose, onRowWillOpen, onSwipeActive, openRowId, setRowRef],
    );

    const busy = loading || refreshing;

    return (
      <FlatList
        data={busy ? undefined : notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={busy ? undefined : renderSeparator}
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
