/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';
import { ListRenderItemInfo, View } from 'react-native';

import { PaginatedFlashList, PaginatedFlashListProps, PaginatedFlatList, PaginatedFlatListProps } from '../paginated-list';
import { createDocumentArrayProxy, DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import {
  DocumentListItem,
  DocumentSpacerListItem,
  FolderListItem,
  FolderSpacerListItem,
  renderPlacerholderItem,
} from './item-component';
import {
  DocumentItem,
  FolderItem,
  PaginatedDocumentFlashListProps,
  PaginatedDocumentFlatListProps,
  PaginatedDocumentListItem,
} from './types';

export function PaginatedDocumentFlashList<ItemT extends DocumentItem>({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps>) {
  const { data, documentsIndexStart } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < documentsIndexStart, [documentsIndexStart]);

  const getItemType: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItem>>['getItemType']> = React.useCallback(
    (item, index) => {
      if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
      return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
    },
    [isIndexForFolderOrSpacerItem],
  );

  const keyExtractor: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItem>>['keyExtractor']> = React.useCallback(
    (item, index) => {
      if (item === FOLDER_SPACER_ITEM_DATA || item === DOCUMENT_SPACER_ITEM_DATA) return 'spacer' + index.toString();
      return (getItemType(item, index) ?? '')?.toString() + item.id;
    },
    [getItemType],
  );

  const renderItem: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItem>>['renderItem']> = React.useCallback(
    (
      info:
        | Parameters<PaginatedFlashListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]
        | Parameters<PaginatedFlashListProps<typeof DOCUMENT_SPACER_ITEM_DATA>['renderItem']>[0]
        | Parameters<PaginatedFlashListProps<DocumentItem>['renderItem']>[0]
        | Parameters<PaginatedFlashListProps<FolderItem>['renderItem']>[0],
    ) => {
      if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
      if (info.item === DOCUMENT_SPACER_ITEM_DATA) return <DocumentSpacerListItem {...info} />;
      return isIndexForFolderOrSpacerItem(info.index) ? (
        <FolderListItem
          {...(info as Parameters<PaginatedFlashListProps<FolderItem>['renderItem']>[0])}
          onPress={e => onPressFolder?.(info.item, e)}
        />
      ) : (
        <DocumentListItem
          {...(info as Parameters<PaginatedFlashListProps<DocumentItem>['renderItem']>[0])}
          onPress={e => onPressDocument?.((info as Parameters<PaginatedFlashListProps<ItemT>['renderItem']>[0]).item, e)}
        />
      );
    },
    [isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
  );

  const getVisibleItemIndex: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItem>>['getVisibleItemIndex']> =
    React.useCallback(n => n - documentsIndexStart, [documentsIndexStart]);

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

/////
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

export function PaginatedDocumentFlatList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlatListProps>) {
  const { data, documentsIndexStart } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < documentsIndexStart, [documentsIndexStart]);

  const keyExtractor: NonNullable<Readonly<PaginatedFlatListProps<PaginatedDocumentListItem>>['keyExtractor']> = React.useCallback(
    (item, index) => {
      if (item === FOLDER_SPACER_ITEM_DATA || item === DOCUMENT_SPACER_ITEM_DATA) return 'spacer' + index.toString();
      return (isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document') + item.id;
    },
    [isIndexForFolderOrSpacerItem],
  );

  const renderItem = React.useCallback(
    (info: ListRenderItemInfo<PaginatedDocumentListItem>) => {
      if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
      if (info.item === DOCUMENT_SPACER_ITEM_DATA) return <DocumentSpacerListItem {...info} />;
      return isIndexForFolderOrSpacerItem(info.index) ? (
        <FolderListItem
          {...(info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0])}
          onPress={e => onPressFolder?.((info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0]).item, e)}
        />
      ) : (
        <DocumentListItem
          {...(info as Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0])}
          onPress={e => onPressDocument?.((info as Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0]).item, e)}
        />
      );
    },
    [isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
  );

  const getVisibleItemIndex: NonNullable<Readonly<PaginatedFlatListProps<PaginatedDocumentListItem>>['getVisibleItemIndex']> =
    React.useCallback(n => n - documentsIndexStart, [documentsIndexStart]);

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
