/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';

import { PaginatedFlashList, PaginatedFlashListProps, PaginatedFlatList, PaginatedFlatListProps } from '../paginated-list';
import { createDocumentArrayProxy, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import { DocumentListItem, FolderListItem, FolderSpacerListItem, renderPlacerholderItem } from './item-component';
import {
  DocumentItem,
  FolderItem,
  PaginatedDocumentFlashListProps,
  PaginatedDocumentFlatListProps,
  PaginatedDocumentListItemType,
} from './types';

export function PaginatedDocumentFlashList<ItemT extends DocumentItem>({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps<ItemT>>) {
  const { data, totalFolders } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < totalFolders, [totalFolders]);

  const getItemType: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItemType<ItemT>>>['getItemType']> =
    React.useCallback(
      (item, index) => {
        if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
        return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
      },
      [isIndexForFolderOrSpacerItem],
    );

  const keyExtractor: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItemType<ItemT>>>['keyExtractor']> =
    React.useCallback(
      (item, index) => {
        if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer' + index.toString();
        return (getItemType(item, index) ?? '')?.toString() + item.id;
      },
      [getItemType],
    );

  const renderItem: NonNullable<Readonly<PaginatedFlashListProps<PaginatedDocumentListItemType<ItemT>>>['renderItem']> =
    React.useCallback(
      (
        info:
          | Parameters<PaginatedFlashListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]
          | Parameters<PaginatedFlashListProps<DocumentItem>['renderItem']>[0]
          | Parameters<PaginatedFlashListProps<FolderItem>['renderItem']>[0],
      ) => {
        if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
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

  const getVisibleItemIndex: NonNullable<
    Readonly<PaginatedFlashListProps<PaginatedDocumentListItemType<ItemT>>>['getVisibleItemIndex']
  > = React.useCallback(n => n - totalFolders, [totalFolders]);

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

export function PaginatedDocumentFlatList<ItemT extends DocumentItem>({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlatListProps<ItemT>>) {
  const { data, totalFolders } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < totalFolders, [totalFolders]);

  const keyExtractor: NonNullable<Readonly<PaginatedFlatListProps<PaginatedDocumentListItemType<ItemT>>>['keyExtractor']> =
    React.useCallback(
      (item, index) => {
        if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer' + index.toString();
        return (isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document') + item.id;
      },
      [isIndexForFolderOrSpacerItem],
    );

  const renderItem: NonNullable<Readonly<PaginatedFlatListProps<PaginatedDocumentListItemType<ItemT>>>['renderItem']> =
    React.useCallback(
      (
        info:
          | Parameters<PaginatedFlatListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]
          | Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0]
          | Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0],
      ) => {
        if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
        return isIndexForFolderOrSpacerItem(info.index) ? (
          <FolderListItem
            {...(info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0])}
            onPress={e => onPressFolder?.(info.item, e)}
          />
        ) : (
          <DocumentListItem
            {...(info as Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0])}
            onPress={e => onPressDocument?.((info as Parameters<PaginatedFlatListProps<ItemT>['renderItem']>[0]).item, e)}
          />
        );
      },
      [isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
    );

  const getVisibleItemIndex: NonNullable<
    Readonly<PaginatedFlatListProps<PaginatedDocumentListItemType<ItemT>>>['getVisibleItemIndex']
  > = React.useCallback(n => n - totalFolders, [totalFolders]);

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
