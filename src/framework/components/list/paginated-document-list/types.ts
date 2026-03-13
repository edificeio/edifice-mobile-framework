import { TouchableOpacityProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import type { DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';

import { EntAppNameOrSynonym } from '~/app/intents';
import type { PaginatedFlashListProps, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { IMedia } from '~/framework/util/media-deprecated';

interface DocumentItemBase<IdType> {
  title: string;
  id: IdType;
  thumbnail?: string;
  date: Temporal.Instant;
  url: string;
  resourceEntId: string;
  testID?: string;
}

export interface DocumentItemEntApp<AppTypes extends EntAppNameOrSynonym, IdType> extends DocumentItemBase<IdType> {
  appName: Exclude<AppTypes, 'workspace'>;
}

export interface DocumentItemWorkspaceBase<IdType> extends DocumentItemBase<IdType> {
  appName: 'workspace';
}

export interface DocumentItemWorkspaceMedia<IdType> extends DocumentItemWorkspaceBase<IdType> {
  type: Exclude<IMedia['type'], 'document'>;
}

export interface DocumentItemWorkspaceDocumentMedia<IdType> extends DocumentItemWorkspaceBase<IdType> {
  type: Extract<IMedia['type'], 'document'>;
  extension?: string;
}

export type DocumentItemWorkspace<IdType> = DocumentItemWorkspaceMedia<IdType> | DocumentItemWorkspaceDocumentMedia<IdType>;

export type DocumentItem<AppTypes extends EntAppNameOrSynonym, IdType> =
  | DocumentItemEntApp<AppTypes, IdType>
  | DocumentItemWorkspace<IdType>;

export interface FolderItem<IdType> {
  title: string;
  id: IdType;
}

export type PaginatedDocumentListItem<AppTypes extends EntAppNameOrSynonym, IdType> =
  | DocumentItem<AppTypes, IdType>
  | FolderItem<IdType>
  | typeof FOLDER_SPACER_ITEM_DATA
  | typeof DOCUMENT_SPACER_ITEM_DATA;

export interface CommonPaginatedDocumentListProps<AppTypes extends EntAppNameOrSynonym, IdType> {
  documents: PaginatedFlashListProps<DocumentItem<AppTypes, IdType>>['data'];
  folders: PaginatedFlashListProps<FolderItem<IdType>>['data'];
  overrideItemLayout?: PaginatedFlashListProps<PaginatedDocumentListItem<AppTypes, IdType>>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem<IdType>, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (
    document: DocumentItem<AppTypes, IdType>,
    event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0],
  ) => void;
  alwaysShowAppIcon?: boolean;
}

export interface PaginatedDocumentFlashListProps<AppTypes extends EntAppNameOrSynonym, IdType>
  extends Omit<
      PaginatedFlashListProps<DocumentItem<AppTypes, IdType> | FolderItem<IdType>>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<AppTypes, IdType> {}

export interface PaginatedDocumentFlatListProps<AppTypes extends EntAppNameOrSynonym, IdType>
  extends Omit<
      PaginatedFlatListProps<PaginatedDocumentListItem<AppTypes, IdType>>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<AppTypes, IdType> {}
