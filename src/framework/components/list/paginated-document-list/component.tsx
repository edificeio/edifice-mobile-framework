/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React from 'react';
import { ListRenderItemInfo as FlatListRenderItemInfo, StyleSheet, ViewStyle } from 'react-native';

import { ListRenderItemInfo as FlashListRenderItemInfo } from '@shopify/flash-list';

import { PaginatedFlashList, PaginatedFlatList } from '~/framework/components/list/paginated-list';
import { Media } from '~/framework/modules/media';

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

/**
 * Symbol used to represent a spacer ensuring that folders are not on the same line as documents.
 */
export const FOLDER_SPACER_ITEM_DATA = Symbol('FOLDER_SPACER_ITEM_DATA');

/**
 * Symbol used to represent a spacer ensuring that items are a multiple of the number of columns.
 */
export const DOCUMENT_SPACER_ITEM_DATA = Symbol('DOCUMENT_SPACER_ITEM_DATA');

export const useDocumentPagination = <
  IdType,
  MediaT extends Media,
  InfoType extends
    | FlatListRenderItemInfo<PaginatedDocumentListItem<IdType, MediaT>>
    | FlashListRenderItemInfo<PaginatedDocumentListItem<IdType, MediaT>>,
>({
  alwaysShowAppIcon,
  documents,
  folders,
  numColumns = 1,
  onPressDocument,
  onPressFolder,
}: {
  documents: CommonPaginatedDocumentListProps<IdType, MediaT>['documents'];
  folders: CommonPaginatedDocumentListProps<IdType, MediaT>['folders'];
  onPressFolder: CommonPaginatedDocumentListProps<IdType, MediaT>['onPressFolder'];
  onPressDocument: CommonPaginatedDocumentListProps<IdType, MediaT>['onPressDocument'];
  numColumns?: number;
  alwaysShowAppIcon: CommonPaginatedDocumentListProps<IdType, MediaT>['alwaysShowAppIcon'];
}) => {
  const { data, documentsIndexStart } = React.useMemo(() => {
    const folderSpacers = (numColumns - ((folders?.length ?? 0) % numColumns)) % numColumns;
    const documentSpacers = (numColumns - ((documents?.length ?? 0) % numColumns)) % numColumns;
    return {
      data: [
        ...(folders ?? []),
        ...new Array(folderSpacers).fill(FOLDER_SPACER_ITEM_DATA),
        ...(documents ?? []),
        ...new Array(documentSpacers).fill(DOCUMENT_SPACER_ITEM_DATA),
      ],
      documentsIndexStart: folderSpacers + (folders?.length ?? 0),
    };
  }, [documents, folders, numColumns]);

  const isIndexForFolderOrSpacerItem = React.useCallback((index: number) => index < documentsIndexStart, [documentsIndexStart]);

  // getItemType exists only in FlashList so no need to use the generic type
  const getItemType = React.useCallback(
    (item: PaginatedDocumentListItem<IdType, MediaT>, index: number) => {
      if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer';
      return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
    },
    [isIndexForFolderOrSpacerItem],
  );

  const keyExtractor = React.useCallback(
    (item: PaginatedDocumentListItem<IdType, MediaT>, index: number) => {
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
      if (isIndexForFolderOrSpacerItem(info.index)) {
        return (
          <FolderListItem
            {...(info as FlatListRenderItemInfo<FolderItem<IdType>>)}
            onPress={e => onPressFolder?.((info as FlatListRenderItemInfo<FolderItem<IdType>>).item, e)}
            style={itemStyle}
          />
        );
      } else {
        const documentInfo = info as FlatListRenderItemInfo<DocumentItem<IdType, MediaT>>;
        return (
          <DocumentListItem
            {...documentInfo}
            onPress={e => onPressDocument?.((info as FlatListRenderItemInfo<DocumentItem<IdType, MediaT>>).item, e)}
            style={itemStyle}
            testID={'document-item'}
            alwaysShowAppIcon={alwaysShowAppIcon}
          />
        );
      }
    },
    [getItemStyle, isIndexForFolderOrSpacerItem, alwaysShowAppIcon, onPressFolder, onPressDocument],
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

export function PaginatedDocumentFlashList<IdType, MediaT extends Media = Media>({
  alwaysShowAppIcon = true,
  contentContainerStyle: _contentContainerStyle,
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps<IdType, MediaT>>) {
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

export function PaginatedDocumentFlatList<IdType, MediaT extends Media = Media>({
  alwaysShowAppIcon = true,
  contentContainerStyle: _contentContainerStyle,
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlatListProps<IdType, MediaT>>) {
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
