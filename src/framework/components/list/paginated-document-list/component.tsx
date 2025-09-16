/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';
import { ListRenderItemInfo as FlatListRenderItemInfo } from 'react-native';

import { ListRenderItemInfo as FlashListRenderItemInfo } from '@shopify/flash-list';

import { PaginatedFlashList, PaginatedFlatList } from '../paginated-list';
import { createDocumentArrayProxy, DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import {
  DocumentListItem,
  DocumentSpacerListItem,
  FolderListItem,
  FolderSpacerListItem,
  renderPlacerholderItem,
} from './item-component';
import {
  CommonPaginatedDocumentListProps,
  DocumentItem,
  FolderItem,
  PaginatedDocumentFlashListProps,
  PaginatedDocumentFlatListProps,
  PaginatedDocumentListItem,
} from './types';

export const useDocumentPagination = <
  InfoType extends FlatListRenderItemInfo<PaginatedDocumentListItem> | FlashListRenderItemInfo<PaginatedDocumentListItem>,
>({
  documents,
  folders,
  numColumns,
  onPressDocument,
  onPressFolder,
}: {
  documents: CommonPaginatedDocumentListProps['documents'];
  folders: CommonPaginatedDocumentListProps['folders'];
  onPressFolder: CommonPaginatedDocumentListProps['onPressFolder'];
  onPressDocument: CommonPaginatedDocumentListProps['onPressDocument'];
  numColumns?: number;
}) => {
  const { data, documentsIndexStart } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], numColumns),
    [documents, folders, numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < documentsIndexStart, [documentsIndexStart]);

  // getItemType exists only in FlashList so no need to use the generic type
  const getItemType = React.useCallback(
    (item: PaginatedDocumentListItem, index: number) => {
      if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
      return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
    },
    [isIndexForFolderOrSpacerItem],
  );

  const keyExtractor = React.useCallback(
    (item: PaginatedDocumentListItem, index: number) => {
      if (item === FOLDER_SPACER_ITEM_DATA || item === DOCUMENT_SPACER_ITEM_DATA) return 'spacer' + index.toString();
      return (getItemType(item, index) ?? '')?.toString() + item.id;
    },
    [getItemType],
  );

  const renderItem = React.useCallback<(info: InfoType) => React.ReactElement>(
    (info: InfoType) => {
      if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
      if (info.item === DOCUMENT_SPACER_ITEM_DATA) return <DocumentSpacerListItem {...info} />;
      return isIndexForFolderOrSpacerItem(info.index) ? (
        <FolderListItem
          {...(info as FlatListRenderItemInfo<FolderItem>)}
          onPress={e => onPressFolder?.((info as FlatListRenderItemInfo<FolderItem>).item, e)}
        />
      ) : (
        <DocumentListItem
          {...(info as FlatListRenderItemInfo<DocumentItem>)}
          onPress={e => onPressDocument?.((info as FlatListRenderItemInfo<DocumentItem>).item, e)}
        />
      );
    },
    [isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
  );

  const getVisibleItemIndex = React.useCallback((n: number) => n - documentsIndexStart, [documentsIndexStart]);

  return {
    data,
    getItemType,
    getVisibleItemIndex,
    keyExtractor,
    renderItem,
  };
};

export function PaginatedDocumentFlashList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps>) {
  const { data, getItemType, getVisibleItemIndex, keyExtractor, renderItem } = useDocumentPagination({
    documents,
    folders,
    numColumns: paginatedListProps.numColumns,
    onPressDocument,
    onPressFolder,
  });

  return (
    <PaginatedFlashList
      data={data}
      getItemType={getItemType}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlacerholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}

export function PaginatedDocumentFlatList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlatListProps>) {
  const { data, getVisibleItemIndex, keyExtractor, renderItem } = useDocumentPagination({
    documents,
    folders,
    numColumns: paginatedListProps.numColumns,
    onPressDocument,
    onPressFolder,
  });

  return (
    <PaginatedFlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlacerholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}
