// import React, { ReactElement } from 'react';
// import { View } from 'react-native';

import * as React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';

import { createDecoratedArrayProxy } from './proxy';
import { CommunitiesDocumentAppName, CommunitiesDocumentId } from './types';

import { useDocumentPagination } from '~/framework/components/list/paginated-document-list/component';
import {
  CommonPaginatedDocumentListProps,
  PaginatedDocumentListItem,
} from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import ScrollView from '~/framework/components/scrollView';
import { LoadingState } from '~/framework/hooks/loader';

export type CommunityPaginatedDocumentListItem =
  | PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId>
  | React.ReactElement;

export interface CommunityPaginatedDocumentFlatListProps
  extends Omit<
      PaginatedFlatListProps<CommunityPaginatedDocumentListItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<CommunitiesDocumentAppName, CommunitiesDocumentId> {
  stickyElements?: React.ReactElement[];
  stickyPlaceholderElements?: React.ReactElement[];
}

export function CommunityPaginatedDocumentFlatList({
  alwaysShowAppIcon = true,
  documents,
  folders,
  ListEmptyComponent,
  onPageReached: _onPageReached,
  onPressDocument,
  onPressFolder,
  stickyElements = [],
  stickyPlaceholderElements = [],
  ...paginatedListProps
}: Readonly<CommunityPaginatedDocumentFlatListProps>) {
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
    numColumns: paginatedListProps.numColumns,
    onPressDocument,
    onPressFolder,
  });

  const [loadingState, setLoadingState] = React.useState<LoadingState>(LoadingState.PRISTINE);

  // Override onPageReached to have a first loaded boolean value.
  // No need to do the same with onItemsReached because it'll be called twice.
  const onPageReached = React.useCallback<NonNullable<CommunityPaginatedDocumentFlatListProps['onPageReached']>>(
    async (page, reloadAll) => {
      await _onPageReached?.(page, reloadAll);
      setLoadingState(LoadingState.DONE);
    },
    [_onPageReached],
  );

  const { data } = React.useMemo(
    () => createDecoratedArrayProxy(stickyElements, _data, paginatedListProps.numColumns),
    [stickyElements, _data, paginatedListProps.numColumns],
  );

  const renderItem = React.useCallback(
    (info: ListRenderItemInfo<CommunityPaginatedDocumentListItem>) =>
      React.isValidElement(info.item)
        ? info.item
        : _renderItem(info as ListRenderItemInfo<PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId>>),
    [_renderItem],
  );

  const renderPlaceholderItem = React.useCallback(
    (info: ListRenderItemInfo<typeof LOADING_ITEM_DATA | React.ReactElement>) =>
      React.isValidElement(info.item) ? info.item : _renderPlaceholderItem(info as ListRenderItemInfo<typeof LOADING_ITEM_DATA>),
    [_renderPlaceholderItem],
  );

  const keyExtractor = React.useCallback(
    (item: PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId> | React.ReactElement, index: number) =>
      React.isValidElement(item)
        ? item.key || 'sticky-' + index
        : _keyExtractor(item as PaginatedDocumentListItem<CommunitiesDocumentAppName, CommunitiesDocumentId>, index),
    [_keyExtractor],
  );

  const { data: placeholderData } = React.useMemo(
    () =>
      createDecoratedArrayProxy(
        stickyPlaceholderElements,
        new Array(8).fill(typeof LOADING_ITEM_DATA),
        paginatedListProps.numColumns,
      ),
    [stickyPlaceholderElements, paginatedListProps.numColumns],
  );

  // Because of sticky elements, we need to check if the data is empty and print the empty state manually
  if (ListEmptyComponent && ((loadingState === LoadingState.DONE && _data.length === 0) || loadingState === LoadingState.REFRESH)) {
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

export default CommunityPaginatedDocumentFlatList;
