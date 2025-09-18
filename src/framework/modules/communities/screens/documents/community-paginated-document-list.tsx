// import React, { ReactElement } from 'react';
// import { View } from 'react-native';

import * as React from 'react';
import { ListRenderItemInfo } from 'react-native';

import { createDecoratedArrayProxy } from './proxy';

import { useDocumentPagination } from '~/framework/components/list/paginated-document-list/component';
import {
  CommonPaginatedDocumentListProps,
  PaginatedDocumentListItem,
} from '~/framework/components/list/paginated-document-list/types';
import { PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';

export type CommunityPaginatedDocumentListItem = PaginatedDocumentListItem | React.ReactElement;

export interface CommunityPaginatedDocumentFlatListProps
  extends Omit<
      PaginatedFlatListProps<CommunityPaginatedDocumentListItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps {
  stickyElements?: React.ReactElement[];
}

export function CommunityPaginatedDocumentFlatList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  stickyElements = [],
  ...paginatedListProps
}: Readonly<CommunityPaginatedDocumentFlatListProps>) {
  const {
    data: _data,
    getVisibleItemIndex,
    keyExtractor: _keyExtractor,
    renderItem: _renderItem,
    renderPlaceholderItem,
  } = useDocumentPagination({
    documents,
    folders,
    numColumns: paginatedListProps.numColumns,
    onPressDocument,
    onPressFolder,
  });

  const { data } = React.useMemo(
    () => createDecoratedArrayProxy(stickyElements, _data, paginatedListProps.numColumns),
    [stickyElements, _data, paginatedListProps.numColumns],
  );

  const renderItem = React.useCallback(
    (info: ListRenderItemInfo<CommunityPaginatedDocumentListItem>) =>
      React.isValidElement(info.item) ? info.item : _renderItem(info as ListRenderItemInfo<PaginatedDocumentListItem>),
    [_renderItem],
  );

  const keyExtractor = React.useCallback(
    (item: PaginatedDocumentListItem | React.ReactElement, index: number) =>
      React.isValidElement(item) ? item.key || 'sticky-' + index : _keyExtractor(item as PaginatedDocumentListItem, index),
    [_keyExtractor],
  );

  return (
    <PaginatedFlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlaceholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}

export default CommunityPaginatedDocumentFlatList;
