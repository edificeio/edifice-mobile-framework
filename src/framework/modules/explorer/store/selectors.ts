import type { FolderId } from '~/framework/modules/explorer/model/types';
import { toExplorerApp } from '~/framework/modules/explorer/service';
import type { API } from '~/framework/modules/explorer/service/types';

import type { ExplorerFolderData, ExplorerRootState } from './state';

export const selectExplorerState = (state: ExplorerRootState) => state.explorer;

/**
 * The data of a folder, for the context of the API (`application` as the API takes it): converted to the app the data is kept
 * under, like the service does. Nothing for an application without a known app (see `toExplorerApp`).
 */
export const selectExplorerFolder = (context: API.Explorer.ContextQuery, folderId: FolderId) => {
  const app = toExplorerApp(context.application);
  return (state: ExplorerRootState): ExplorerFolderData | undefined => (app ? state.explorer[app]?.[folderId] : undefined);
};
