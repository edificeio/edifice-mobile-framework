import * as React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SwipeRow } from '~/framework/components/list/swipeable/row';

import styles from './styles';
import { SwipeableListProps } from './types';

export default function SwipeableList<ItemT>({
  extraData,
  getSwipeActions,
  keyExtractor,
  ListFooterComponent,
  onScrollBeginDrag,
  onSwipeActiveChange,
  renderItem,
  ...listProps
}: Readonly<SwipeableListProps<ItemT>>) {
  const listRef = React.useRef<FlashListRef<ItemT>>(null);

  const scrollToTopRef = React.useRef({ scrollToTop: () => listRef.current?.scrollToOffset({ animated: false, offset: 0 }) });
  useScrollToTop(scrollToTopRef);

  // the last row stays above the bottom of the screen.
  const footer = React.useMemo(() => <View style={styles.footer}>{ListFooterComponent}</View>, [ListFooterComponent]);

  const rowRefs = React.useRef<Record<string, SwipeableMethods | null>>({});
  const openRowKey = React.useRef<string | null>(null);
  const [openRowId, setOpenRowId] = React.useState<string | null>(null);

  const setRowRef = React.useCallback((id: string, row: SwipeableMethods | null) => {
    rowRefs.current[id] = row;
    if (row || openRowKey.current !== id) return;
    openRowKey.current = null;
    setOpenRowId(current => (current === id ? null : current));
  }, []);

  const closeRow = React.useCallback((id: string) => {
    rowRefs.current[id]?.close();
  }, []);

  // only one row stays open at a time.
  const onRowWillOpen = React.useCallback(
    (id: string) => {
      const previous = openRowKey.current;
      if (previous && previous !== id) closeRow(previous);
      openRowKey.current = id;
    },
    [closeRow],
  );

  const onRowOpen = React.useCallback((id: string) => setOpenRowId(id), []);

  const onRowClose = React.useCallback(
    (id: string) => {
      if (openRowKey.current === id) openRowKey.current = null;
      setOpenRowId(current => (current === id ? null : current));
      onSwipeActiveChange?.(false);
    },
    [onSwipeActiveChange],
  );

  const onSwipeActive = React.useCallback((active: boolean) => onSwipeActiveChange?.(active), [onSwipeActiveChange]);

  // the open row is read at tap time, so that opening a row does not render the others again.
  const hasOpenRow = React.useCallback(() => openRowKey.current !== null, []);

  const closeOpenRow = React.useCallback(() => {
    if (openRowKey.current) closeRow(openRowKey.current);
  }, [closeRow]);

  const onListScrollBeginDrag = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      closeOpenRow();
      onScrollBeginDrag?.(event);
    },
    [closeOpenRow, onScrollBeginDrag],
  );

  useFocusEffect(React.useCallback(() => closeOpenRow, [closeOpenRow]));

  const renderRow = React.useCallback(
    ({ index, item }: ListRenderItemInfo<ItemT>) => {
      const id = keyExtractor(item);
      return (
        <SwipeRow
          id={id}
          index={index}
          item={item}
          isRowOpened={openRowId === id}
          getSwipeActions={getSwipeActions}
          hasOpenRow={hasOpenRow}
          renderItem={renderItem}
          onClose={onRowClose}
          onCloseOpenRow={closeOpenRow}
          onOpen={onRowOpen}
          onRef={setRowRef}
          onSwipeActive={onSwipeActive}
          onWillOpen={onRowWillOpen}
        />
      );
    },
    [
      closeOpenRow,
      getSwipeActions,
      hasOpenRow,
      keyExtractor,
      onRowClose,
      onRowOpen,
      onRowWillOpen,
      onSwipeActive,
      openRowId,
      renderItem,
      setRowRef,
    ],
  );

  const listExtraData = React.useMemo(() => [openRowId, extraData], [extraData, openRowId]);

  return (
    <FlashList
      {...listProps}
      ref={listRef}
      extraData={listExtraData}
      ListFooterComponent={footer}
      keyExtractor={keyExtractor}
      renderItem={renderRow}
      onScrollBeginDrag={onListScrollBeginDrag}
    />
  );
}
