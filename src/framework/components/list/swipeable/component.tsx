import * as React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { SwipeRowsContext } from '~/framework/components/list/swipeable/context';
import { SwipeRow } from '~/framework/components/list/swipeable/row';

import styles from './styles';
import { SwipeableFlashListProps, SwipeRowsContextValue } from './types';

const SwipeableFlashList = <ItemT,>({
  extraData,
  getSwipeActions,
  keyExtractor,
  ListFooterComponent,
  onScrollBeginDrag,
  onSwipeActiveChange,
  renderItem,
  ...listProps
}: Readonly<SwipeableFlashListProps<ItemT>>) => {
  const listRef = React.useRef<FlashListRef<ItemT>>(null);

  const scrollToTopRef = React.useRef({ scrollToTop: () => listRef.current?.scrollToOffset({ animated: false, offset: 0 }) });
  useScrollToTop(scrollToTopRef);

  // the last row stays above the bottom of the screen, with or without a footer, as in the FlatList wrapper.
  const footer = React.useMemo(() => {
    const FooterComponent = ListFooterComponent;
    if (!FooterComponent || React.isValidElement(FooterComponent)) return <View style={styles.footer}>{FooterComponent}</View>;
    return (
      <View style={styles.footer}>
        <FooterComponent />
      </View>
    );
  }, [ListFooterComponent]);

  const rowRefs = React.useRef<Record<string, SwipeableMethods | null>>({});
  const openRowKey = React.useRef<string | null>(null);
  const [openRowId, setOpenRowId] = React.useState<string | null>(null);

  const registerRow = React.useCallback((id: string, row: SwipeableMethods | null) => {
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

  const onRowOpened = React.useCallback((id: string) => setOpenRowId(id), []);

  const onRowClosed = React.useCallback(
    (id: string) => {
      if (openRowKey.current === id) openRowKey.current = null;
      setOpenRowId(current => (current === id ? null : current));
      onSwipeActiveChange?.(false);
    },
    [onSwipeActiveChange],
  );

  const onSwipeActive = React.useCallback((active: boolean) => onSwipeActiveChange?.(active), [onSwipeActiveChange]);

  // the open row is read at tap time, so that opening a row does not render the others again.
  const hasOpenedRow = React.useCallback(() => openRowKey.current !== null, []);

  const closeOpenedRow = React.useCallback(() => {
    if (openRowKey.current) closeRow(openRowKey.current);
  }, [closeRow]);

  const swipeRows = React.useMemo<SwipeRowsContextValue>(
    () => ({ closeOpenedRow, hasOpenedRow, onRowClosed, onRowOpened, onRowWillOpen, onSwipeActive, registerRow }),
    [closeOpenedRow, hasOpenedRow, onRowClosed, onRowOpened, onRowWillOpen, onSwipeActive, registerRow],
  );

  const onListScrollBeginDrag = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      closeOpenedRow();
      onScrollBeginDrag?.(event);
    },
    [closeOpenedRow, onScrollBeginDrag],
  );

  useFocusEffect(React.useCallback(() => closeOpenedRow, [closeOpenedRow]));

  const renderRow = React.useCallback(
    ({ index, item, target }: ListRenderItemInfo<ItemT>) => {
      const id = keyExtractor(item);
      return (
        <SwipeRow
          id={id}
          extraData={extraData}
          index={index}
          item={item}
          isRowOpened={openRowId === id}
          getSwipeActions={getSwipeActions}
          renderItem={renderItem}
          target={target}
        />
      );
    },
    [extraData, getSwipeActions, keyExtractor, openRowId, renderItem],
  );

  const listExtraData = React.useMemo(() => [openRowId, extraData], [extraData, openRowId]);

  return (
    <SwipeRowsContext.Provider value={swipeRows}>
      <FlashList
        {...listProps}
        ref={listRef}
        extraData={listExtraData}
        keyExtractor={keyExtractor}
        ListFooterComponent={footer}
        renderItem={renderRow}
        onScrollBeginDrag={onListScrollBeginDrag}
      />
    </SwipeRowsContext.Provider>
  );
};

export default SwipeableFlashList;
