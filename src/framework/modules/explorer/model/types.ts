import type { OldEntAppNameOrSynonym } from '~/app/intents';
import type { DocumentItem, FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { PaginatedListItem } from '~/framework/components/list/paginated-list';
import { ResourceMedia } from '~/modules/media/types';

export const enum RootFolderId {
  ROOT = 'default',
  TRASH = 'bin',
}
export type UserFolderId = string;
export type FolderId = RootFolderId | UserFolderId;

export type ExplorerAppTypes = Exclude<OldEntAppNameOrSynonym, 'workspace'>;
/** An app whose resources the explorer shows: the `name` of its `EntApp`, converted by the service from the `application` of the API. */
export type ExplorerApp = 'Blog' | 'Cahier Multimédia' | 'Cahier de texte' | 'Wiki';
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
