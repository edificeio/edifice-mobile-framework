import type { OldEntAppNameOrSynonym } from '~/app/intents';
import type { DocumentItem, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { PaginatedListItem } from '~/framework/components/list/paginated-list';

import { ResourceMedia } from '../../media';

export const enum RootFolderId {
  ROOT = 'default',
  TRASH = 'bin',
}
export type UserFolderId = string;
export type FolderId = RootFolderId | UserFolderId;

export type ExplorerAppTypes = Exclude<OldEntAppNameOrSynonym, 'workspace'>;
export type ExplorerResourceIdType = string;

export interface ExplorerPageData {
  pagination: {
    pageStart: number;
    pageSize: number;
    total: number;
  };
  folders: FolderItem<FolderId>[];
  resources: DocumentItem<ExplorerResourceIdType, ResourceMedia>[];
}

export interface ExplorerFolderContent {
  folders: FolderItem<FolderId>[];
  resources: PaginatedListItem<DocumentItem<ExplorerResourceIdType, ResourceMedia>>[];
}
