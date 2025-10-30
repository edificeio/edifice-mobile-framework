import type { EntAppNameOrSynonym } from '~/app/intents';
import type { DocumentItemEntApp, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { PaginatedListItem } from '~/framework/components/list/paginated-list';

export const enum RootFolderId {
  ROOT = 'default',
  TRASH = 'bin',
}
export type UserFolderId = string;
export type FolderId = RootFolderId | UserFolderId;

export type ExplorerAppTypes = Exclude<EntAppNameOrSynonym, 'workspace'>;
export type ExplorerResourceIdType = string;

export interface ExplorerPageData {
  pagination: {
    pageStart: number;
    pageSize: number;
    total: number;
  };
  folders: FolderItem<FolderId>[];
  resources: DocumentItemEntApp<ExplorerAppTypes, ExplorerResourceIdType>[];
}

export interface ExplorerFolderContent {
  folders: FolderItem<FolderId>[];
  resources: PaginatedListItem<DocumentItemEntApp<ExplorerAppTypes, ExplorerResourceIdType>>[];
}
