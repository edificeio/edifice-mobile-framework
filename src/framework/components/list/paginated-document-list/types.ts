import { TouchableOpacityProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import type { PaginatedFlashListProps, PaginatedFlatListProps } from '../paginated-list';
import type { FOLDER_SPACER_ITEM_DATA } from './documents-proxy';

import { EntAppNameOrSynonym } from '~/app/intents';
import { IMedia } from '~/framework/util/media';

interface DocumentItemBase {
  title: string;
  id: number;
  thumbnail?: string;
  date: Temporal.Instant;
  url: string;
  resourceEntId: string;
}

export interface DocumentItemEntApp<AppTypes extends EntAppNameOrSynonym> extends DocumentItemBase {
  appName: Exclude<AppTypes, 'workspace'>;
}

export interface DocumentItemWorkspaceBase extends DocumentItemBase {
  appName: 'workspace';
}

export interface DocumentItemWorkspaceMedia extends DocumentItemWorkspaceBase {
  type: Exclude<IMedia['type'], 'document'>;
}

export interface DocumentItemWorkspaceDocumentMedia extends DocumentItemWorkspaceBase {
  type: Extract<IMedia['type'], 'document'>;
  extension?: string;
}

export type DocumentItemWorkspace = DocumentItemWorkspaceMedia | DocumentItemWorkspaceDocumentMedia;

export type DocumentItem<AppTypes extends EntAppNameOrSynonym = EntAppNameOrSynonym> =
  | DocumentItemEntApp<AppTypes>
  | DocumentItemWorkspace;

export interface FolderItem {
  title: string;
  id: number;
}

export type PaginatedDocumentListItemType<DocumentType extends DocumentItem> =
  | DocumentType
  | FolderItem
  | typeof FOLDER_SPACER_ITEM_DATA;

interface CommonPaginatedDocumentListProps<DocumentType extends DocumentItem> {
  documents: PaginatedFlashListProps<DocumentType>['data'];
  folders: PaginatedFlashListProps<FolderItem>['data'];
  overrideItemLayout?: PaginatedFlashListProps<PaginatedDocumentListItemType<DocumentType>>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (document: DocumentType, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
}

export interface PaginatedDocumentFlashListProps<DocumentType extends DocumentItem>
  extends Omit<
      PaginatedFlashListProps<DocumentType | FolderItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<DocumentType> {}

export interface PaginatedDocumentFlatListProps<DocumentType extends DocumentItem>
  extends Omit<
      PaginatedFlatListProps<DocumentType | FolderItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps<DocumentType> {}
