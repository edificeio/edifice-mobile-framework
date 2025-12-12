import * as React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';

import {
  LOADING_ITEM_DATA,
  PaginatedFlatList,
  PaginatedFlatListProps,
  PaginatedListItem,
} from '~/framework/components/list/paginated-list';
import ScrollView from '~/framework/components/scrollView';
import { LoadingState } from '~/framework/hooks/loader';
import { createDecoratedArrayProxy } from '~/framework/modules/communities/screens/documents/proxy';

export interface DecoratedPaginatedFlatListProps<ItemType>
  extends Omit<PaginatedFlatListProps<ItemType | React.ReactElement>, 'keyExtractor' | 'renderItem' | 'renderPlaceholderItem'> {
  keyExtractor: NonNullable<PaginatedFlatListProps<ItemType>['keyExtractor']>;
  renderItem: NonNullable<PaginatedFlatListProps<ItemType>['renderItem']>;
  renderPlaceholderItem: NonNullable<PaginatedFlatListProps<ItemType>['renderPlaceholderItem']>;
  stickyElements?: React.ReactElement[];
  stickyPlaceholderElements?: React.ReactElement[];
}

export function DecoratedPaginatedFlatList<ItemType>({
  data: _data,
  keyExtractor: _keyExtractor,
  ListEmptyComponent,
  onPageReached: _onPageReached,
  renderItem: _renderItem,
  renderPlaceholderItem: _renderPlaceholderItem,
  stickyElements = [],
  stickyPlaceholderElements = [],
  ...paginatedListProps
}: Readonly<DecoratedPaginatedFlatListProps<ItemType>>) {
  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.PRISTINE);

  // Override onPageReached to have a first loaded boolean value.
  // No need to do the same with onItemsReached because it'll be called twice.
  const onPageReached = React.useCallback<NonNullable<DecoratedPaginatedFlatListProps<ItemType>['onPageReached']>>(
    async (page, reloadAll) => {
      await _onPageReached?.(page, reloadAll);
      setLoadingState(LoadingState.DONE);
    },
    [_onPageReached],
  );

  const inputData = React.useMemo(() => _data ?? [], [_data]);

  const { data, stickyItemsPadding } = React.useMemo(
    () => createDecoratedArrayProxy(stickyElements, inputData, paginatedListProps.numColumns),
    [stickyElements, inputData, paginatedListProps.numColumns],
  );

  const getVisibleItemIndex = React.useCallback<
    NonNullable<PaginatedFlatListProps<PaginatedListItem<ItemType>>['getVisibleItemIndex']>
  >(index => index - stickyItemsPadding, [stickyItemsPadding]);

  const renderItem = React.useCallback(
    (info: ListRenderItemInfo<ItemType | React.ReactElement>) =>
      React.isValidElement(info.item) ? info.item : _renderItem(info as ListRenderItemInfo<ItemType>),
    [_renderItem],
  );

  const renderPlaceholderItem = React.useCallback(
    (info: ListRenderItemInfo<typeof LOADING_ITEM_DATA | React.ReactElement>) =>
      React.isValidElement(info.item) ? info.item : _renderPlaceholderItem(info as ListRenderItemInfo<typeof LOADING_ITEM_DATA>),
    [_renderPlaceholderItem],
  );

  const keyExtractor = React.useCallback(
    (item: ItemType | React.ReactElement, index: number) =>
      React.isValidElement(item) ? item.key || 'sticky-' + index : _keyExtractor?.(item as ItemType, index),
    [_keyExtractor],
  );

  const { data: placeholderData } = React.useMemo(
    () =>
      createDecoratedArrayProxy(
        stickyPlaceholderElements,
        new Array(4).fill(typeof LOADING_ITEM_DATA),
        paginatedListProps.numColumns,
      ),
    [stickyPlaceholderElements, paginatedListProps.numColumns],
  );

  // Because of sticky elements, we need to check if the data is empty and print the empty state manually
  if (
    ListEmptyComponent &&
    ((loadingState === LoadingState.DONE && inputData.length === 0) || loadingState === LoadingState.REFRESH)
  ) {
    return (
      <ScrollView
        {...paginatedListProps}
        refreshControl={
          <RefreshControl
            refreshing={loadingState === LoadingState.REFRESH}
            onRefresh={() => {
              setLoadingState(LoadingState.REFRESH);
              onPageReached(0, true);
            }}
          />
        }>
        {stickyElements}
        {React.isValidElement<any>(ListEmptyComponent) ? ListEmptyComponent : <ListEmptyComponent />}
      </ScrollView>
    );
  }

  return (
    <PaginatedFlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      placeholderData={placeholderData}
      renderPlaceholderItem={renderPlaceholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      onPageReached={onPageReached}
      {...paginatedListProps}
    />
  );
}

export default DecoratedPaginatedFlatList;
