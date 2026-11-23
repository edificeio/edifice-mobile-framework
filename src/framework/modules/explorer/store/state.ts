/**
 * State of `explorer` in the redux store: the folders and resources loaded, by app, then by folder. The root folders (`default`,
 * `bin`) have the same id in every app: the apps never share their data.
 */
import type { FolderItem } from '~/framework/components/list/paginated-document-list/types';
import type { ExplorerApp, ExplorerFolderContent, FolderId } from '~/framework/modules/explorer/model/types';

export interface ExplorerFolderData {
  content?: ExplorerFolderContent;
  metadata?: FolderItem<FolderId>;
}

export interface ExplorerAppData {
  [folderId: FolderId]: ExplorerFolderData;
}

export type ExplorerState = { [app in ExplorerApp]?: ExplorerAppData };

/** What the selectors need of the global state: the reducer is registered under the name of the module. */
export interface ExplorerRootState {
  explorer: ExplorerState;
}

export const initialState: ExplorerState = {};

export const emptyFolderData: ExplorerFolderContent = { folders: [], resources: [] };
