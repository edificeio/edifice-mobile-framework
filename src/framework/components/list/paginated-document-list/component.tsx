/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';
import { ListRenderItemInfo as FlatListRenderItemInfo, ViewStyle } from 'react-native';

import { ListRenderItemInfo as FlashListRenderItemInfo } from '@shopify/flash-list';

import { PaginatedFlashList, PaginatedFlatList } from '../paginated-list';
import { createDocumentArrayProxy, DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';
import {
  DocumentListItem,
  DocumentPlaceholderItem,
  DocumentSpacerListItem,
  FolderListItem,
  FolderSpacerListItem,
} from './item-component';
import styles from './styles';
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
  numColumns = 1,
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

  const getItemStyle = React.useCallback(
    ({ index }: Pick<InfoType, 'index'>) => {
      const outputStyle: ViewStyle = {};
      if (index % numColumns === 0) {
        outputStyle.marginLeft = styles.item.margin * 2;
      }
      if (index % numColumns === numColumns - 1) {
        outputStyle.marginRight = styles.item.margin * 2;
      }
      return outputStyle;
    },
    [numColumns],
  );

  const renderItem = React.useCallback<(info: InfoType) => React.ReactElement>(
    (info: InfoType) => {
      const itemStyle = getItemStyle(info);
      if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} style={itemStyle} />;
      if (info.item === DOCUMENT_SPACER_ITEM_DATA) return <DocumentSpacerListItem {...info} style={itemStyle} />;
      return isIndexForFolderOrSpacerItem(info.index) ? (
        <FolderListItem
          {...(info as FlatListRenderItemInfo<FolderItem>)}
          onPress={e => onPressFolder?.((info as FlatListRenderItemInfo<FolderItem>).item, e)}
          style={itemStyle}
        />
      ) : (
        <DocumentListItem
          {...(info as FlatListRenderItemInfo<DocumentItem>)}
          onPress={e => onPressDocument?.((info as FlatListRenderItemInfo<DocumentItem>).item, e)}
          style={itemStyle}
        />
      );
    },
    [getItemStyle, isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder],
  );

  const renderPlaceholderItem = React.useCallback<(info: Pick<InfoType, 'index'>) => React.ReactElement>(
    ({ index }) => {
      const itemStyle = getItemStyle({ index });
      return <DocumentPlaceholderItem style={itemStyle} />;
    },
    [getItemStyle],
  );

  const getVisibleItemIndex = React.useCallback((n: number) => n - documentsIndexStart, [documentsIndexStart]);

  return {
    data,
    getItemType,
    getVisibleItemIndex,
    keyExtractor,
    renderItem,
    renderPlaceholderItem,
  };
};

export function PaginatedDocumentFlashList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps>) {
  const { data, getItemType, getVisibleItemIndex, keyExtractor, renderItem, renderPlaceholderItem } = useDocumentPagination({
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
      renderPlaceholderItem={renderPlaceholderItem}
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
  const { data, getVisibleItemIndex, keyExtractor, renderItem, renderPlaceholderItem } = useDocumentPagination({
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
      renderPlaceholderItem={renderPlaceholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}
