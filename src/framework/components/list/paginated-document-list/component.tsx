/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';
import { ListRenderItemInfo as FlatListRenderItemInfo, StyleSheet, ViewStyle } from 'react-native';

import { ListRenderItemInfo as FlashListRenderItemInfo } from '@shopify/flash-list';

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

import { EntAppNameOrSynonym } from '~/app/intents';
import { PaginatedFlashList, PaginatedFlatList } from '~/framework/components/list/paginated-list';

export const useDocumentPagination = <
  AppTypes extends EntAppNameOrSynonym,
  IdType,
  InfoType extends
    | FlatListRenderItemInfo<PaginatedDocumentListItem<AppTypes, IdType>>
    | FlashListRenderItemInfo<PaginatedDocumentListItem<AppTypes, IdType>>,
>({
  alwaysShowAppIcon,
  documents,
  folders,
  numColumns = 1,
  onPressDocument,
  onPressFolder,
}: {
  documents: CommonPaginatedDocumentListProps<AppTypes, IdType>['documents'];
  folders: CommonPaginatedDocumentListProps<AppTypes, IdType>['folders'];
  onPressFolder: CommonPaginatedDocumentListProps<AppTypes, IdType>['onPressFolder'];
  onPressDocument: CommonPaginatedDocumentListProps<AppTypes, IdType>['onPressDocument'];
  numColumns?: number;
  alwaysShowAppIcon: CommonPaginatedDocumentListProps<AppTypes, IdType>['alwaysShowAppIcon'];
}) => {
  const { data, documentsIndexStart } = React.useMemo(
    () => createDocumentArrayProxy(folders ?? [], documents ?? [], numColumns),
    [documents, folders, numColumns],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < documentsIndexStart, [documentsIndexStart]);

  // getItemType exists only in FlashList so no need to use the generic type
  const getItemType = React.useCallback(
    (item: PaginatedDocumentListItem<AppTypes, IdType>, index: number) => {
      if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
      return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
    },
    [isIndexForFolderOrSpacerItem],
  );

  const keyExtractor = React.useCallback(
    (item: PaginatedDocumentListItem<AppTypes, IdType>, index: number) => {
      if (item === FOLDER_SPACER_ITEM_DATA || item === DOCUMENT_SPACER_ITEM_DATA) return 'spacer' + index.toString();
      return (getItemType(item, index) ?? '')?.toString() + item.id;
    },
    [getItemType],
  );

  const getItemStyle = React.useCallback(
    ({ index }: Pick<InfoType, 'index'>) => {
      const outputStyle: ViewStyle = {};
      // Left
      if (index % numColumns === 0) {
        outputStyle.marginLeft = styles.item.margin * 2;
      }
      // Right
      if (index % numColumns === numColumns - 1) {
        outputStyle.marginRight = styles.item.margin * 2;
      }
      return outputStyle;
    },
    [numColumns],
  );

  const contentContainerStyle = { paddingVertical: styles.item.margin };

  const renderItem = React.useCallback<(info: InfoType) => React.ReactElement>(
    (info: InfoType) => {
      const itemStyle = getItemStyle(info);
      if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} style={itemStyle} />;
      if (info.item === DOCUMENT_SPACER_ITEM_DATA) return <DocumentSpacerListItem {...info} style={itemStyle} />;
      return isIndexForFolderOrSpacerItem(info.index) ? (
        <FolderListItem
          {...(info as FlatListRenderItemInfo<FolderItem<IdType>>)}
          onPress={e => onPressFolder?.((info as FlatListRenderItemInfo<FolderItem<IdType>>).item, e)}
          style={itemStyle}
        />
      ) : (
        <DocumentListItem
          {...(info as FlatListRenderItemInfo<DocumentItem<AppTypes, IdType>>)}
          onPress={e => onPressDocument?.((info as FlatListRenderItemInfo<DocumentItem<AppTypes, IdType>>).item, e)}
          style={itemStyle}
          testID={'document-item'}
          alwaysShowAppIcon={alwaysShowAppIcon}
        />
      );
    },
    [getItemStyle, isIndexForFolderOrSpacerItem, onPressDocument, onPressFolder, alwaysShowAppIcon],
  );

  const renderPlaceholderItem = React.useCallback<(info: Pick<InfoType, 'index'>) => React.ReactElement>(
    ({ index }) => {
      const itemStyle = getItemStyle({ index }); // Note: No need to know how many elements we have during rendering placeholder data
      return <DocumentPlaceholderItem style={itemStyle} />;
    },
    [getItemStyle],
  );

  const getVisibleItemIndex = React.useCallback((n: number) => n - documentsIndexStart, [documentsIndexStart]);

  return {
    contentContainerStyle,
    data,
    getItemType,
    getVisibleItemIndex,
    keyExtractor,
    renderItem,
    renderPlaceholderItem,
  };
};

export function PaginatedDocumentFlashList<AppTypes extends EntAppNameOrSynonym, IdType>({
  alwaysShowAppIcon = true,
  contentContainerStyle: _contentContainerStyle,
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps<AppTypes, IdType>>) {
  const { contentContainerStyle, data, getItemType, getVisibleItemIndex, keyExtractor, renderItem, renderPlaceholderItem } =
    useDocumentPagination({
      alwaysShowAppIcon,
      documents,
      folders,
      numColumns: paginatedListProps.numColumns,
      onPressDocument,
      onPressFolder,
    });

  return (
    <PaginatedFlashList
      contentContainerStyle={React.useMemo(
        () => StyleSheet.flatten([contentContainerStyle, _contentContainerStyle]),
        [_contentContainerStyle, contentContainerStyle],
      )}
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

export function PaginatedDocumentFlatList<AppTypes extends EntAppNameOrSynonym, IdType>({
  alwaysShowAppIcon = true,
  contentContainerStyle: _contentContainerStyle,
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlatListProps<AppTypes, IdType>>) {
  const { contentContainerStyle, data, getVisibleItemIndex, keyExtractor, renderItem, renderPlaceholderItem } =
    useDocumentPagination({
      alwaysShowAppIcon,
      documents,
      folders,
      numColumns: paginatedListProps.numColumns,
      onPressDocument,
      onPressFolder,
    });

  return (
    <PaginatedFlatList
      contentContainerStyle={React.useMemo(
        () => StyleSheet.flatten([contentContainerStyle, _contentContainerStyle]),
        [_contentContainerStyle, contentContainerStyle],
      )}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={renderPlaceholderItem}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}
