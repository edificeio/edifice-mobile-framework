import { TouchableOpacityProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import type { PaginatedListProps } from '../paginated-list';
import type { FOLDER_SPACER_ITEM_DATA } from './documents-proxy';

import theme from '~/app/theme';
import { IMedia } from '~/framework/util/media';

interface DocumentItemBase {
  title: string;
  id: number;
  thumbnail?: string;
  date: Temporal.Instant;
}

export interface DocumentItemEntapp extends DocumentItemBase {
  appName: Exclude<keyof typeof theme.apps, 'workspace'>;
}

interface DocumentItemWorkspaceBase extends DocumentItemBase {
  appName: Extract<keyof typeof theme.apps, 'workspace'>;
}

export interface DocumentItemWorkspaceMedia extends DocumentItemWorkspaceBase {
  type: Exclude<IMedia['type'], 'document'>;
}

export interface DocumentItemWorkspaceDocumentMedia extends DocumentItemWorkspaceBase {
  appName: Extract<keyof typeof theme.apps, 'workspace'>;
  type: Extract<IMedia['type'], 'document'>;
  extension?: string;
}

export type DocumentItemWorkspace = DocumentItemWorkspaceMedia | DocumentItemWorkspaceDocumentMedia;

export type DocumentItem = DocumentItemEntapp | DocumentItemWorkspace;

export interface FolderItem {
  title: string;
  id: number;
}

export type PaginatedDocumentListItemType = DocumentItem | FolderItem | typeof FOLDER_SPACER_ITEM_DATA;

export interface PaginatedDocumentListProps
  extends Omit<
    PaginatedListProps<DocumentItem | FolderItem>,
    'data' | 'keyExtractor' | 'getItemType' | 'overrideItemLayout' | 'renderItem' | 'renderPlaceholderItem'
  > {
  documents: PaginatedListProps<DocumentItem>['data'];
  folders: PaginatedListProps<FolderItem>['data'];
  overrideItemLayout?: PaginatedListProps<PaginatedDocumentListItemType>['overrideItemLayout'];
  onPressFolder?: (folder: FolderItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
  onPressDocument?: (folder: DocumentItem, event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => void;
}
