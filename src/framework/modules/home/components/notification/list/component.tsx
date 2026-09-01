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

import { canOpenNotification } from '../util';
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
    onDeleteItem,
    onEndReached,
    onPressItem,
    onRefresh,
    onReportItem,
    onSwipeActiveChange,
    refreshing,
    userId,
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
      },
      [closeRow],
    );

    const onRowOpen = React.useCallback((id: string) => setOpenRowId(id), []);

    const onScrollBeginDrag = React.useCallback(() => {
      if (openRowKey.current) closeRow(openRowKey.current);
    }, [closeRow]);

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
      (notification: ITimelineNotification) => {
        const openedRowId = openRowKey.current;
        if (openedRowId) return closeRow(openedRowId);
        if (canOpenNotification(notification)) onPressItem(notification);
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

    const onDelete = React.useCallback(
      async (id: string) => {
        try {
          await onDeleteItem(id);
        } finally {
          closeRow(id);
        }
      },
      [closeRow, onDeleteItem],
    );

    useFocusEffect(
      React.useCallback(
        () => () => {
          if (openRowKey.current) closeRow(openRowKey.current);
        },
        [closeRow],
      ),
    );

    const shownNotifications = React.useMemo(() => notifications.filter(item => !item.deleted), [notifications]);

    const renderItem = React.useCallback(
      ({ item }: ListRenderItemInfo<ITimelineNotification>) => (
        <NotificationRow
          item={item}
          canDelete={item.backupData?.sender !== userId}
          canReport={canReport}
          isRowOpened={openRowId === item.id}
          someRowOpen={!!openRowId}
          onClose={onRowClose}
          onDelete={onDelete}
          onOpen={onRowOpen}
          onPress={onCardPress}
          onRef={setRowRef}
          onReport={onReport}
          onSwipeActive={onSwipeActive}
          onWillOpen={onRowWillOpen}
        />
      ),
      [
        canReport,
        onCardPress,
        onDelete,
        onReport,
        onRowClose,
        onRowOpen,
        onRowWillOpen,
        onSwipeActive,
        openRowId,
        setRowRef,
        userId,
      ],
    );

    const loadingOrRefreshing = loading || refreshing;

    return (
      <FlatList
        showsVerticalScrollIndicator={false}
        scrollEnabled={!loadingOrRefreshing}
        data={loadingOrRefreshing ? undefined : shownNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={loadingOrRefreshing ? undefined : renderSeparator}
        contentContainerStyle={loadingOrRefreshing || shownNotifications.length ? undefined : styles.empty}
        ListEmptyComponent={loadingOrRefreshing ? <NotificationsPlaceholder preview /> : renderEmpty}
        ListFooterComponent={loadingMore ? <NotificationsPlaceholder count={PLACEHOLDER_NEXT_PAGE_CARDS} /> : null}
        refreshControl={refreshControl}
        onScrollBeginDrag={onScrollBeginDrag}
        onEndReached={onEndReached}
        onEndReachedThreshold={1}
      />
    );
  },
);
