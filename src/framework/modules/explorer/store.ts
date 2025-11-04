import * as React from 'react';

import { Temporal } from '@js-temporal/polyfill';

import type { ExplorerFolderContent, ExplorerPageData, Folder, FolderId } from './model/types';
import explorerModuleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import { IUnkownModuleConfig } from '~/framework/util/moduleTool';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export type ExplorerAction = { type: `${string}_LOAD_PAGE`; flushPreviousData: boolean; folderId: FolderId } & ExplorerPageData;

export interface ExplorerState {
  [folderId: FolderId]: {
    content?: ExplorerFolderContent;
    metadata?: Folder;
  };
}

export const EMPTY_FOLDER_ITEM_NAME: string = 'SpacerFolder';
//EMPTY_FOLDER_ITEM is used when the folder count is odd, to fill the last row of the grid.
const EMPTY_FOLDER_ITEM = {
  application: '',
  assetId: '',
  createdAt: Temporal.Now.instant(),
  creatorName: '',
  id: '',
  location: [],
  name: EMPTY_FOLDER_ITEM_NAME,
  resourceType: 'folder',
  sharedRights: [],
  userRights: [],
};

export const emptyFolderData: ExplorerFolderContent = { items: [], nbFolders: 0, nbResources: 0 };

export const createExplorerReducer = (moduleConfig: Pick<IUnkownModuleConfig, 'namespaceActionType'>) => {
  return createSessionReducer<ExplorerState, ExplorerAction>(
    {},
    {
      [moduleConfig.namespaceActionType(explorerModuleConfig.namespaceActionType('LOAD_PAGE'))]: (state, action) => {
        // This complicated algorithm merges old data with new data :
        // - Folders are always all replaced
        // - Totals are always replaced
        // - Resources are replaced if flushPreviousData === true OR total number of resources has changed
        // - Resources are merged else

        const nbFolders = action.folders.length;
        const isFolderCountEven = nbFolders % 2 === 0;

        // 1. Replace all folders + initiate resource array with the good length
        const oldFolderContent = state[action.folderId]?.content ?? emptyFolderData;

        const foldersWithExtraEmpty = isFolderCountEven
          ? [...action.folders]
          : [...action.folders, { ...EMPTY_FOLDER_ITEM, id: `emptyFolder-${nbFolders}` }];
        const newItems: ExplorerFolderContent['items'] = [
          ...foldersWithExtraEmpty,
          ...new Array(action.pagination.total).fill(null),
        ];
        const keepOldResources = !action.flushPreviousData && oldFolderContent.nbResources === action.pagination.total;
        // 2. Iterate over all resource and merge data if applicable
        for (let iResource = 0; iResource < action.pagination.total; ++iResource) {
          if (iResource >= action.pagination.pageStart && iResource < action.pagination.pageStart + action.pagination.pageSize) {
            // These are resources from the new page data
            newItems[foldersWithExtraEmpty.length + iResource] = action.resources[iResource - action.pagination.pageStart];
          } else if (keepOldResources) {
            // These are resources from the previously loaded data
            newItems[foldersWithExtraEmpty.length + iResource] = oldFolderContent.items[oldFolderContent.nbFolders + iResource];
          }
        }
        // 3. Return with replacing totals
        return {
          // Previous data
          ...state,
          // Current folder (content)
          [action.folderId]: {
            ...state[action.folderId],
            content: {
              items: newItems,
              nbFolders: foldersWithExtraEmpty.length,
              nbResources: action.pagination.total,
            },
          },
          // children of current folder (metadata)
          ...action.folders.reduce<ExplorerState>((acc, f) => ({ ...acc, [f.id]: { ...acc[f.id], metadata: f } }), {}),
        };
      },
    },
  );
};

export const createExplorerActions = (moduleConfig: Pick<IUnkownModuleConfig, 'namespaceActionType'>) => ({
  loadPage: (folderId: FolderId, data: ExplorerPageData, flushPreviousData: boolean = false): ExplorerAction => ({
    flushPreviousData,
    folderId,
    type: moduleConfig.namespaceActionType(explorerModuleConfig.namespaceActionType('LOAD_PAGE')) as `${string}_LOAD_PAGE`,
    ...data,
  }),
});

export const useExplorerActions = (moduleConfig: Pick<IUnkownModuleConfig, 'namespaceActionType'>) => {
  return React.useRef<ReturnType<typeof createExplorerActions>>(createExplorerActions(moduleConfig)).current;
};

export const createExplorerSelectors = (
  moduleConfig: Pick<IUnkownModuleConfig, 'namespaceActionType'>,
  selector: (state: IGlobalState) => ExplorerState,
) => ({
  folder: (folderId: FolderId) => (state: IGlobalState) =>
    (selector(state)[folderId] ?? undefined) as ExplorerState[keyof ExplorerState] | undefined,
});
