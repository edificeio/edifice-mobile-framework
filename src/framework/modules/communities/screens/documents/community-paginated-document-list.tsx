// import React, { ReactElement } from 'react';
// import { View } from 'react-native';

import * as React from 'react';

import { useDocumentPagination } from '~/framework/components/list/paginated-document-list/component';
import { renderPlacerholderItem } from '~/framework/components/list/paginated-document-list/item-component';
import {
  PaginatedDocumentFlatListProps,
  PaginatedDocumentListItem,
} from '~/framework/components/list/paginated-document-list/types';
import { PaginatedFlatList } from '~/framework/components/list/paginated-list';

// import { createCommunityDocumentArrayProxy, createDecoratedArrayProxy } from './proxy';
// import styles from './styles';
// import { CommunitiesDocumentItem } from './types';

// import { PaginatedDocumentFlatList } from '~/framework/components/list/paginated-document-list/component';
// import {
//   DocumentListItem,
//   FolderListItem,
//   FolderSpacerListItem,
//   renderPlacerholderItem,
// } from '~/framework/components/list/paginated-document-list/item-component';
// import {
//   CommonPaginatedDocumentListProps,
//   DocumentItem,
//   FolderItem,
//   PaginatedDocumentListItem,
// } from '~/framework/components/list/paginated-document-list/types';
// import { PaginatedFlatList, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';

export type CommunityPaginatedDocumentListItem = PaginatedDocumentListItem | React.ReactElement;

export interface CommunityPaginatedDocumentFlatListProps extends PaginatedDocumentFlatListProps {
  stickyElements?: React.ReactElement[];
}

export function CommunityPaginatedDocumentFlatList({
  documents,
  folders,
  onPressDocument,
  onPressFolder,
  // stickyElements = [],
  ...paginatedListProps
}: Readonly<CommunityPaginatedDocumentFlatListProps>) {
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

export default CommunityPaginatedDocumentFlatList;

// export default function CommunityPaginatedDocumentFlatList({
//   documents,
//   folders,
//   onPressDocument,
//   onPressFolder,
//   stickyElements = [],
//   ...paginatedListProps
// }: Readonly<CommunityPaginatedDocumentFlatListProps>) {
//   const { data, stickyItemsPadding } = React.useMemo(
//     () => createDecoratedArrayProxy(stickyElements, folders ?? [], documents ?? [], paginatedListProps.numColumns),
//     [documents, folders, paginatedListProps.numColumns, stickyElements],
//   );

//   const isIndexForFolderOrFolderSpacerItem = React.useCallback(
//     (index: number) => index >= stickyItemsPadding && index < totalFolders + stickyItemsPadding,
//     [stickyItemsPadding, totalFolders],
//   );

//   const isIndexForStickyItem = React.useCallback((index: number) => index < stickyItemsPadding, [stickyItemsPadding]);
//   const isIndexForDocumentSpacer = React.useCallback(
//     (index: number) => index >= stickyItemsPadding + totalFolders + (documents?.length ?? 0),
//     [documents?.length, stickyItemsPadding, totalFolders],
//   );

//   const keyExtractor: NonNullable<Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItem>>['keyExtractor']> =
//     React.useCallback(
//       (item, index) => {
//         if (isIndexForStickyItem(index)) return 'sticky' + index.toString();
//         if (item === FOLDER_SPACER_ITEM_DATA) return 'spacer' + index.toString();
//         return (
//           (isIndexForFolderOrFolderSpacerItem(index) ? 'folder' : 'document') + (item as Exclude<typeof item, ReactElement>).id
//         );
//       },
//       [isIndexForFolderOrFolderSpacerItem, isIndexForStickyItem],
//     );

//   const renderItem: NonNullable<Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItem>>['renderItem']> =
//     React.useCallback(
//       info => {
//         const realIndex = info.index - stickyItemsPadding;
//         const realNumColumns = paginatedListProps.numColumns ?? 1;
//         const itemWrapperStyle = {
//           marginLeft: realIndex % realNumColumns === 0 ? styles.list.padding + styles.item.margin : styles.item.margin,
//           marginRight:
//             realIndex % realNumColumns === realNumColumns - 1 ? styles.list.padding + styles.item.margin : styles.item.margin,
//           marginTop: realIndex < realNumColumns ? styles.list.padding + styles.item.margin : styles.item.margin,
//         };
//         if (isIndexForStickyItem(info.index)) return info.item as Extract<typeof info.item, ReactElement>;
//         else if (isIndexForDocumentSpacer(info.index)) {
//           return <View style={[styles.item, styles.endSpacer]} />;
//         } else if (info.item === FOLDER_SPACER_ITEM_DATA) return <FolderSpacerListItem {...info} style={itemWrapperStyle} />;
//         else
//           return isIndexForFolderOrFolderSpacerItem(info.index) ? (
//             <FolderListItem
//               {...(info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0])}
//               onPress={e =>
//                 info.item !== FOLDER_SPACER_ITEM_DATA &&
//                 onPressFolder?.((info as Parameters<PaginatedFlatListProps<FolderItem>['renderItem']>[0]).item, e)
//               }
//             />
//           ) : (
//             <DocumentListItem
//               style={itemWrapperStyle}
//               {...(info as Parameters<PaginatedFlatListProps<DocumentItem>['renderItem']>[0])}
//               onPress={e =>
//                 onPressDocument?.((info as Parameters<PaginatedFlatListProps<CommunitiesDocumentItem>['renderItem']>[0]).item, e)
//               }
//             />
//           );
//       },
//       [
//         isIndexForDocumentSpacer,
//         isIndexForFolderOrFolderSpacerItem,
//         isIndexForStickyItem,
//         onPressDocument,
//         onPressFolder,
//         paginatedListProps.numColumns,
//         stickyItemsPadding,
//       ],
//     );

//   const getVisibleItemIndex: NonNullable<
//     Readonly<PaginatedFlatListProps<CommunityPaginatedDocumentListItem>>['getVisibleItemIndex']
//   > = React.useCallback(n => n - totalFolders - stickyItemsPadding, [totalFolders, stickyItemsPadding]);

//   return (
//     <PaginatedDocumentFlatList
//       folders={folders}
//       documents={documents}
//       getVisibleItemIndex={getVisibleItemIndex}
//       {...paginatedListProps}
//     />
//   );
// }
