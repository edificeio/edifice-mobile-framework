import { TouchableOpacityProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import type { PaginatedListProps } from '../paginated-list';
import type { FOLDER_SPACER_ITEM_DATA } from './documents-proxy';

import { EntAppName } from '~/app/intents';
import { IMedia } from '~/framework/util/media';

interface DocumentItemBase {
  title: string;
  id: number;
  thumbnail?: string;
  date: Temporal.Instant;
  url: string;
  resourceEntId: string;
}

export interface DocumentItemEntApp<AppTypes extends EntAppName> extends DocumentItemBase {
  appName: Exclude<AppTypes, 'workspace'>;
}

export interface DocumentItemWorkspaceBase<AppTypes extends EntAppName> extends DocumentItemBase {
  appName: Extract<AppTypes, 'workspace'>;
}

export interface DocumentItemWorkspaceMedia<AppTypes extends EntAppName> extends DocumentItemWorkspaceBase<AppTypes> {
  type: Exclude<IMedia['type'], 'document'>;
}

export interface DocumentItemWorkspaceDocumentMedia<AppTypes extends EntAppName> extends DocumentItemWorkspaceBase<AppTypes> {
  type: Extract<IMedia['type'], 'document'>;
  extension?: string;
}

export type DocumentItemWorkspace<AppTypes extends EntAppName = EntAppName> =
  | DocumentItemWorkspaceMedia<AppTypes>
  | DocumentItemWorkspaceDocumentMedia<AppTypes>;

export type DocumentItem<AppTypes extends EntAppName = EntAppName> = DocumentItemEntApp<AppTypes> | DocumentItemWorkspace;

export interface FolderItem {
  title: string;
  id: number;
}

export type PaginatedDocumentListItemType<DocumentType extends DocumentItem> =
  | DocumentType
  | FolderItem
  | typeof FOLDER_SPACER_ITEM_DATA;

export interface PaginatedDocumentListProps
  extends Omit<
    PaginatedListProps<DocumentItem | FolderItem>,
    'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
  > {
  documents: PaginatedListProps<DocumentItem>['data'];
  folders: PaginatedListProps<FolderItem>['data'];
  overrideItemLayout?: PaginatedListProps<PaginatedDocumentListItemType<DocumentItem>>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (document: DocumentItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
}
