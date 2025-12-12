import React from 'react';
import { RefreshControl } from 'react-native';

import { createDecoratedArrayProxy } from './proxy';
import { CommunitiesDocumentAppName, CommunitiesDocumentId } from './types';

import { useDocumentPagination } from '~/framework/components/list/paginated-document-list/component';
import {
  PaginatedDocumentFlatListProps,
  PaginatedDocumentListItem,
} from '~/framework/components/list/paginated-document-list/types';
import {
  DEFAULT_FLATLIST_PLACEHOLDER_COUNT,
  LOADING_ITEM_DATA,
  PaginatedFlatList,
  PaginatedFlatListProps,
  PaginatedListItem,
} from '~/framework/components/list/paginated-list';
import ScrollView from '~/framework/components/scrollView';
import { LoadingState } from '~/framework/hooks/loader';

export type DecoratedDocumentListItem =
  | PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId>
  | React.ReactElement;

export interface DecoratedDocumentFlatListProps extends Omit<
  PaginatedDocumentFlatListProps<CommunitiesDocumentAppName, CommunitiesDocumentId>,
  'CellRendererComponent'
> {
  decorations?: React.ReactElement[];
  placeholderDecorations?: React.ReactElement[];
  CellRendererComponent?: PaginatedFlatListProps<DecoratedDocumentListItem>['CellRendererComponent'];
}

export const DecoratedDocumentFlatList = ({
  decorations = [],
  documents,
  folders,
  getItemLayout: _getItemLayout,
  numColumns,
  onPressDocument,
  placeholderDecorations = decorations,
  placeholderNumberOfRows: totalPlaceholderItem = DEFAULT_FLATLIST_PLACEHOLDER_COUNT,
  onPressFolder,
  placeholderData: _placeholderData,
  onViewableItemsChanged: _onViewableItemsChanged,
  ListEmptyComponent,
  onPageReached: _onPageReached,
  alwaysShowAppIcon = true,
  ...props
}: Readonly<DecoratedDocumentFlatListProps>) => {
  const {
    data: _data,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    renderItem: _renderItem,
    renderPlaceholderItem: _renderPlaceholderItem,
  } = useDocumentPagination({
    alwaysShowAppIcon,
    documents,
    folders,
    numColumns,
    onPressDocument,
    onPressFolder,
  });

  // Note: empty state must be handled manually instead of relying on ListEmptyComponent because of the presence of decorations.
  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.PRISTINE);
  // Override onPageReached to have a first loaded boolean value.
  // No need to do the same with onItemsReached because it'll be called twice.
  const onPageReached = React.useCallback<NonNullable<PaginatedFlatListProps<DecoratedDocumentListItem>['onPageReached']>>(
    async (page, reloadAll) => {
      await _onPageReached?.(page, reloadAll);
      setLoadingState(LoadingState.DONE);
    },
    [_onPageReached],
  );

  const { data, stickyItemsPadding } = React.useMemo(
    () => (_data.length ? createDecoratedArrayProxy(decorations, _data, numColumns) : { data: _data, stickyItemsPadding: 0 }),
    [_data, decorations, numColumns],
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
            ...rest,
          });
    },
    [_renderPlaceholderItem, placeholderItemsPadding],
  );

  const getItemLayout = React.useMemo<PaginatedFlatListProps<DecoratedDocumentListItem>['getItemLayout']>(
    () =>
      _getItemLayout
        ? (d, index) => {
            return index < stickyItemsPadding
              ? { index: index - stickyItemsPadding, length: 0, offset: 0 }
              : _getItemLayout(
                  d as
                    | ArrayLike<PaginatedListItem<PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId>>>
                    | null
                    | undefined,
                  index - stickyItemsPadding,
                );
          }
        : undefined,
    [_getItemLayout, stickyItemsPadding],
  );

  // Because of sticky elements, we need to check if the data is empty and print the empty state manually
  if (ListEmptyComponent && ((loadingState === LoadingState.DONE && _data.length === 0) || loadingState === LoadingState.REFRESH))
    return (
      <ScrollView
        {...props}
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

  return (
    <PaginatedFlatList
      onViewableItemsChanged={_onViewableItemsChanged}
      data={data}
      placeholderData={placeholderData}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlaceholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      numColumns={numColumns}
      onPageReached={onPageReached}
      ListEmptyComponent={ListEmptyComponent}
      getItemLayout={getItemLayout}
      {...props}
    />
  );
};
