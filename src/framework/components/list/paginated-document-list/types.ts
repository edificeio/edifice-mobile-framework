import { TouchableOpacityProps } from 'react-native';

import type { PaginatedFlashListProps, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { Media } from '~/framework/modules/media';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

import type { DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './component';

export type AppBadge = {
  icon: string | IAppBadgeInfo['icon'];
  color?: IAppBadgeInfo['color'];
};

export type DocumentItem<IdType, MediaT extends Media> = MediaT & {
  id: IdType;
};

export interface FolderItem<IdType> {
  title: string;
  id: IdType;
}

export type PaginatedDocumentListItem<IdType, MediaT extends Media> =
  | DocumentItem<IdType, MediaT>
  | FolderItem<IdType>
  | typeof FOLDER_SPACER_ITEM_DATA
  | typeof DOCUMENT_SPACER_ITEM_DATA;

export interface CommonPaginatedDocumentListProps<IdType, MediaT extends Media> {
  documents: PaginatedFlashListProps<DocumentItem<IdType, MediaT>>['data'];
  folders: PaginatedFlashListProps<FolderItem<IdType>>['data'];
  overrideItemLayout?: PaginatedFlashListProps<PaginatedDocumentListItem<IdType, MediaT>>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem<IdType>, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (
    document: DocumentItem<IdType, MediaT>,
    event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0],
  ) => void;
  alwaysShowAppIcon?: boolean;
}

export interface PaginatedDocumentFlashListProps<IdType, MediaT extends Media>
  extends
    Omit<
      PaginatedFlashListProps<DocumentItem<IdType, MediaT> | FolderItem<IdType>>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<IdType, MediaT> {}

export interface PaginatedDocumentFlatListProps<IdType, MediaT extends Media>
  extends
    Omit<
      PaginatedFlatListProps<PaginatedDocumentListItem<IdType, MediaT>>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<IdType, MediaT> {}
