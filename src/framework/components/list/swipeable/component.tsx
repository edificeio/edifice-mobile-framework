import * as React from 'react';
import { ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import FlatList from '~/framework/components/list/flat-list';
import { SwipeRow } from '~/framework/components/list/swipeable/row';

import { SwipeableListProps } from './types';

export default function SwipeableList<ItemT>({
  extraData,
  getSwipeActions,
  keyExtractor,
  onScrollBeginDrag,
  onSwipeActiveChange,
  renderItem,
  ...listProps
}: Readonly<SwipeableListProps<ItemT>>) {
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

  const onListScrollBeginDrag = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (openRowKey.current) closeRow(openRowKey.current);
      onScrollBeginDrag?.(event);
    },
    [closeRow, onScrollBeginDrag],
  );

  useFocusEffect(
    React.useCallback(
      () => () => {
        if (openRowKey.current) closeRow(openRowKey.current);
      },
      [closeRow],
    ),
  );

  // a tap first puts back the row left open, wherever it lands, and opens nothing.
  // the open row is read at tap time, so that opening a row does not render the others again.
  const guardPress = React.useCallback(
    (onPress?: () => void) => {
      if (!onPress) return undefined;
      return () => {
        if (openRowKey.current) closeRow(openRowKey.current);
        else onPress();
      };
    },
    [closeRow],
  );

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
          guardPress={guardPress}
          renderItem={renderItem}
          onClose={onRowClose}
          onOpen={onRowOpen}
          onRef={setRowRef}
          onSwipeActive={onSwipeActive}
          onWillOpen={onRowWillOpen}
        />
      );
    },
    [
      getSwipeActions,
      guardPress,
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
    <FlatList
      {...listProps}
      extraData={listExtraData}
      keyExtractor={keyExtractor}
      renderItem={renderRow}
      onScrollBeginDrag={onListScrollBeginDrag}
    />
  );
}
