import { TouchableOpacityProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import type { PaginatedFlashListProps, PaginatedFlatListProps } from '../paginated-list';
import type { DOCUMENT_SPACER_ITEM_DATA, FOLDER_SPACER_ITEM_DATA } from './documents-proxy';

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

export type PaginatedDocumentListItem =
  | DocumentItem
  | FolderItem
  | typeof FOLDER_SPACER_ITEM_DATA
  | typeof DOCUMENT_SPACER_ITEM_DATA;

export interface CommonPaginatedDocumentListProps {
  documents: PaginatedFlashListProps<DocumentItem>['data'];
  folders: PaginatedFlashListProps<FolderItem>['data'];
  overrideItemLayout?: PaginatedFlashListProps<PaginatedDocumentListItem>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (document: DocumentItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
}

export interface PaginatedDocumentFlashListProps
  extends Omit<
      PaginatedFlashListProps<DocumentItem | FolderItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps {}

export interface PaginatedDocumentFlatListProps
  extends Omit<
      PaginatedFlatListProps<PaginatedDocumentListItem>,
      'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
    >,
    CommonPaginatedDocumentListProps {}
