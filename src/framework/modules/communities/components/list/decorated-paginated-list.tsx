import * as React from 'react';
import { RefreshControl } from 'react-native';

import {
  DEFAULT_FLATLIST_PLACEHOLDER_COUNT,
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
  decorations?: React.ReactElement[];
  placeholderDecorations?: React.ReactElement[];
}

export function DecoratedPaginatedFlatList<ItemType>({
  data: _data,
  decorations = [],
  keyExtractor: _keyExtractor,
  ListEmptyComponent,
  onPageReached: _onPageReached,
  renderItem: _renderItem,
  renderPlaceholderItem: _renderPlaceholderItem,
  placeholderDecorations = decorations,
  placeholderData: _placeholderData,
  numColumns,
  placeholderNumberOfRows: totalPlaceholderItem = DEFAULT_FLATLIST_PLACEHOLDER_COUNT,
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
    () => createDecoratedArrayProxy(decorations, inputData, numColumns),
    [decorations, inputData, numColumns],
  );

  // useState is used instead of useRef with a readonly manner to be able to use a init function (refs cannot take function as initialiser)
  const [{ data: placeholderData, stickyItemsPadding: placeholderItemsPadding }] = React.useState(
    React.useCallback(() => {
      const itemsPlaceholderData =
        _placeholderData ??
        (new Array(totalPlaceholderItem * (numColumns ?? 1)).fill(LOADING_ITEM_DATA) as (typeof LOADING_ITEM_DATA)[]);
      return createDecoratedArrayProxy(placeholderDecorations, itemsPlaceholderData, numColumns);
    }, [_placeholderData, numColumns, placeholderDecorations, totalPlaceholderItem]),
  );

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlatListProps<DecoratedDocumentListItem>['keyExtractor']>>(
    (item, index) => {
      return index < stickyItemsPadding
        ? `decoration-${index}`
        : _keyExtractor(item as Exclude<typeof item, React.ReactElement>, index - stickyItemsPadding);
    },
    [_keyExtractor, stickyItemsPadding],
  );

  const getVisibleItemIndex = React.useCallback<
    NonNullable<PaginatedFlatListProps<PaginatedListItem<ItemType>>['getVisibleItemIndex']>
  >(index => index - stickyItemsPadding, [stickyItemsPadding]);

  const renderItem = React.useCallback<NonNullable<PaginatedFlatListProps<DecoratedDocumentListItem>['renderItem']>>(
    ({ index, item, ...rest }) => {
      return index < stickyItemsPadding
        ? (item as Extract<typeof item, React.ReactElement>)
        : _renderItem({
            index: index - stickyItemsPadding,
            item: item as Exclude<typeof item, React.ReactElement>,
            ...rest,
          });
    },
    [_renderItem, stickyItemsPadding],
  );

  const renderPlaceholderItem = React.useCallback<
    NonNullable<PaginatedFlatListProps<typeof LOADING_ITEM_DATA | React.ReactElement>['renderItem']>
  >(
    ({ index, item, ...rest }) => {
      return index < placeholderItemsPadding
        ? (item as Extract<typeof item, React.ReactElement>)
        : _renderPlaceholderItem({
            index: index,
            item: item as typeof LOADING_ITEM_DATA,
            ...rest,
          });
    },
    [_renderPlaceholderItem, placeholderItemsPadding],
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
        {decorations}
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
