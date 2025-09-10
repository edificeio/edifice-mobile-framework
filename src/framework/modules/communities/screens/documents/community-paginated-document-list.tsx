/**
 * PaginatedDocumentList
 * List with pagination handling, with FlashList as list component.
 * Present folders first, then documents.
 */

import React, { ReactElement } from 'react';
import { View } from 'react-native';

import styles from './styles';
import { CommunitiesDocumentItem } from './types';

import {
  createDocumentArrayProxy,
  FOLDER_SPACER_ITEM_DATA,
} from '~/framework/components/list/paginated-document-list/documents-proxy';
import {
  DocumentListItem,
  FolderListItem,
  FolderSpacerListItem,
  renderPlacerholderItem,
} from '~/framework/components/list/paginated-document-list/item-component';
import {
  DocumentItem,
  FolderItem,
  PaginatedDocumentFlashListProps,
  PaginatedDocumentListItemType,
} from '~/framework/components/list/paginated-document-list/types';
import { LOADING_ITEM_DATA, PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';

export type CommunityPaginatedDocumentListItemType = PaginatedDocumentListItemType<CommunitiesDocumentItem> | ReactElement;

export const createCommunityDocumentArrayProxy = (
  stickyItems: ReactElement[],
  folders: NonNullable<PaginatedFlatListProps<FolderItem>['data']>,
  documents: NonNullable<PaginatedFlatListProps<DocumentItem>['data']>,
  numColumns: number = 1,
): {
  data: NonNullable<PaginatedFlatListProps<CommunityPaginatedDocumentListItemType>['data']>;
  totalFolders: number;
  stickyItemsPadding: number;
  totalDocumentSpacers: number;
} => {
  const { data: _data, totalFolders } = createDocumentArrayProxy(folders, documents, numColumns);
  const totalDocumentSpacers = (numColumns - (documents.length % numColumns)) % numColumns;

  const stickyItemsPadding = stickyItems.length * numColumns;

  const data = new Proxy(_data, {
    get(target, prop, receiver) {
      // Length of array
      if (prop === 'length') {
        return stickyItemsPadding + target.length + totalDocumentSpacers;
      }

      // Index access
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const index = Number(prop);
        if (index < stickyItemsPadding) {
          return index % numColumns === 0 ? stickyItems[index / numColumns] : <></>;
        } else if (index < stickyItemsPadding + target.length) {
          return target[index - stickyItemsPadding];
        } else {
          return <></>; // Document spacer
        }
      }

      // Other props bound to the documents array
      const value = target[prop];
      if (value instanceof Function) {
        return function (this: typeof receiver | typeof target, ...args: any[]) {
          return value.apply(this === receiver ? target : this, args);
        };
      }
      return value;
    },

    has(target, prop) {
      // Index access
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const index = Number(prop);
        return index >= 0 && index < stickyItemsPadding + target.length + totalDocumentSpacers;
      }

      // Other props bound to the documents array
      return Object.hasOwn(target, prop);
    },

    ownKeys(target) {
      return [...Array(stickyItemsPadding + target.length + totalDocumentSpacers).keys()].map(String);
    },

    set(_target, _prop, _newValue, _receiver) {
      throw new TypeError('createCommunityDocumentArrayProxy: elements cannot be set.');
    },
  });

  return { data, stickyItemsPadding, totalDocumentSpacers, totalFolders };
};

export default function CommunityPaginatedDocumentList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  stickyElements = [],
  ...paginatedListProps
}: Readonly<PaginatedDocumentFlashListProps<CommunitiesDocumentItem> & { stickyElements?: ReactElement[] }>) {
  const { data, stickyItemsPadding, totalFolders } = React.useMemo(
    () => createCommunityDocumentArrayProxy(stickyElements, folders ?? [], documents ?? [], paginatedListProps.numColumns),
    [documents, folders, paginatedListProps.numColumns, stickyElements],
  );

  const isIndexForFolderOrSpacerItem = React.useCallback(
    (index: number) => index >= stickyItemsPadding && index < totalFolders + stickyItemsPadding,
    [stickyItemsPadding, totalFolders],
  );

  const isIndexForStickyItem = React.useCallback((index: number) => index < stickyItemsPadding, [stickyItemsPadding]);
  const isIndexForDocumentSpacer = React.useCallback(
    (index: number) => index >= stickyItemsPadding + totalFolders + (documents?.length ?? 0),
    [documents?.length, stickyItemsPadding, totalFolders],
  );

  const getItemType: NonNullable<Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItemType>>['getItemType']> =
    React.useCallback(
      (item, index) => {
        if (isIndexForStickyItem(index)) return 'sticky';
        if (item === LOADING_ITEM_DATA) return 'loading';
        if (item === FOLDER_SPACER_ITEM_DATA || isIndexForDocumentSpacer(index)) return 'spacer';
        return isIndexForFolderOrSpacerItem(index) ? 'folder' : 'document';
      },
      [isIndexForDocumentSpacer, isIndexForFolderOrSpacerItem, isIndexForStickyItem],
    );

  const keyExtractor: NonNullable<Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItemType>>['keyExtractor']> =
    React.useCallback(
      (item, index) => {
        if (isIndexForStickyItem(index)) return 'sticky' + index.toString();
        if (item === FOLDER_SPACER_ITEM_DATA || isIndexForDocumentSpacer(index)) return 'spacer' + index.toString();
        return (getItemType(item, index) ?? '')?.toString() + (item as Exclude<typeof item, ReactElement>).id;
      },
      [getItemType, isIndexForDocumentSpacer, isIndexForStickyItem],
    );

  const renderItem: NonNullable<Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItemType>>['renderItem']> =
    React.useCallback(
      (
        info:
          | Parameters<PaginatedFlatListProps<typeof FOLDER_SPACER_ITEM_DATA>['renderItem']>[0]
          | Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0]
          | Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0],
      ) => {
        const realIndex = info.index - stickyItemsPadding;
        const realNumColumns = paginatedListProps.numColumns ?? 1;
        const itemWrapperStyle = {
          marginLeft: realIndex % realNumColumns === 0 ? styles.list.padding + styles.item.margin : styles.item.margin,
          marginRight:
            realIndex % realNumColumns === realNumColumns - 1 ? styles.list.padding + styles.item.margin : styles.item.margin,
          marginTop: realIndex < realNumColumns ? styles.list.padding + styles.item.margin : styles.item.margin,
        };
        if (isIndexForStickyItem(info.index)) return info.item as Extract<typeof info.item, ReactElement>;
        else if (isIndexForDocumentSpacer(info.index)) {
          return <View style={[styles.item, styles.endSpacer]} />;
        } else if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} style={itemWrapperStyle} />;
        else
          return isIndexForFolderOrSpacerItem(info.index) ? (
            <FolderListItem
              {...(info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0])}
              onPress={e => onPressFolder?.(info.item, e)}
            />
          ) : (
            <DocumentListItem
              style={itemWrapperStyle}
              {...(info as Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0])}
              onPress={e =>
                onPressDocument?.((info as Parameters<PaginatedFlatListProps<CommunitiesDocumentItem>['renderItem']>[0]).item, e)
              }
            />
          );
      },
      [
        isIndexForDocumentSpacer,
        isIndexForFolderOrSpacerItem,
        isIndexForStickyItem,
        onPressDocument,
        onPressFolder,
        paginatedListProps.numColumns,
        stickyItemsPadding,
      ],
    );

  const getVisibleItemIndex: NonNullable<
    Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItemType>>['getVisibleItemIndex']
  > = React.useCallback(n => n - totalFolders - stickyItemsPadding, [totalFolders, stickyItemsPadding]);

  return (
    <PaginatedFlatList<CommunityPaginatedDocumentListItemType>
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderPlaceholderItem={React.useCallback(
        info => {
          const realIndex = info.index;
          const realNumColumns = paginatedListProps.numColumns ?? 1;
          const itemWrapperStyle = {
            flex: 1,
            marginLeft: realIndex % realNumColumns === 0 ? styles.list.padding : 0,
            marginRight: realIndex % realNumColumns === realNumColumns - 1 ? styles.list.padding : 0,
            marginTop: realIndex < realNumColumns ? styles.list.padding + styles.item.margin : styles.item.margin,
          };
          return <View style={itemWrapperStyle}>{renderPlacerholderItem()}</View>;
        },
        [paginatedListProps.numColumns],
      )}
      getVisibleItemIndex={getVisibleItemIndex}
      {...paginatedListProps}
    />
  );
}
