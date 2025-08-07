/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';

import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps } from '../paginated-list';
import { createDocumentArrayProxy, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import { DocumentListItem, FolderListItem, FolderSpacerListItem, renderPlacerholderItem } from './item-component';
import { DocumentItem, FolderItem, PaginatedDocumentListItemType, PaginatedDocumentListProps } from './types';

export default function PaginatedDocumentList<ItemT extends DocumentItem>({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentListProps>) {
  const { data, totalFolders } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < totalFolders, [totalFolders]);

  const getItemType: NonNullable<Readonly<PaginatedListProps<PaginatedDocumentListItemType<ItemT>>>['getItemType']> =
    React.useCallback(
      (item, index) => {
        if (item === LOADING_ITEM_DATA) return 'loading';
        if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
        return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
      },
      [isIndexForFolderOrSpacerItem],
    );

  const keyExtractor: NonNullable<Readonly<PaginatedListProps<PaginatedDocumentListItemType<ItemT>>>['keyExtractor']> =
    React.useCallback(
      (item, index) => {
        if (item === LOADING_ITEM_DATA) return 'loading' + index.toString();
        if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer' + index.toString();
        return (getItemType(item, index) ?? '')?.toString() + item.id;
      },
      [getItemType],
    );

  const renderItem: NonNullable<Readonly<PaginatedListProps<PaginatedDocumentListItemType<ItemT>>>['renderItem']> =
    React.useCallback(
      (
        info:
          | Parameters<PaginatedListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]
          | Parameters<PaginatedListProps<DocumentItem>['renderItem']>[0]
          | Parameters<PaginatedListProps<FolderItem>['renderItem']>[0],
      ) => {
        if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} />;
        return isIndexForFolderOrSpacerItem(info.index) ? (
          <FolderListItem
            {...(info as Parameters<PaginatedListProps<FolderItem>['renderItem']>[0])}
            onPress={e => onPressFolder?.(info.item, e)}
          />
        ) : (
          <DocumentListItem
            {...(info as Parameters<PaginatedListProps<DocumentItem>['renderItem']>[0])}
            onPress={e => onPressDocument?.((info as Parameters<PaginatedListProps<DocumentItem>['renderItem']>[0]).item, e)}
          />
        );
      },
      [isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
    );

  const getVisibleItemIndex: NonNullable<
    Readonly<PaginatedListProps<PaginatedDocumentListItemType<ItemT>>>['getVisibleItemIndex']
  > = React.useCallback(n => n - totalFolders, [totalFolders]);

  return (
    <PaginatedList<PaginatedDocumentListItemType<ItemT>>
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
