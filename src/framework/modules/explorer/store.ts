import * as React from 'react';

import type { ExplorerFolderContent, ExplorerPageData, FolderId } from './model/types';
import explorerModuleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import { FolderItem } from '~/framework/components/list/paginated-document-list/types';
import { staleOrSplice } from '~/framework/components/list/paginated-list';
import { IUnkownModuleConfig } from '~/framework/util/moduleTool';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export type ExplorerAction = { type: `${string}_LOAD_PAGE`; flushPreviousData: boolean; folderId: FolderId } & ExplorerPageData;

export interface ExplorerState {
  [folderId: FolderId]: {
    content?: ExplorerFolderContent;
    metadata?: FolderItem<FolderId>;
  };
}

export const emptyFolderData: ExplorerFolderContent = { folders: [], resources: [] };

export const createExplorerReducer = (moduleConfig: Pick<IUnkownModuleConfig, 'namespaceActionType'>) => {
  return createSessionReducer<ExplorerState, ExplorerAction>(
    {},
    {
      [moduleConfig.namespaceActionType(explorerModuleConfig.namespaceActionType('LOAD_PAGE'))]: (state, action) => {
        console.info('ACTION', action);
        const newState = {
          // Previous data
          ...state,
          [action.folderId]: {
            ...state[action.folderId],
            // Current folder (content)
            content: {
              folders: action.folders,
              resources: staleOrSplice({
                newData: action.resources,
                previousData: state[action.folderId]?.content?.resources ?? [],
                reloadAll: action.flushPreviousData,
                start: action.pagination.pageStart,
                total: action.pagination.total,
              }),
            },
            // Current folder (metadata)
          },
          // children of current folder (metadata)
          ...action.folders.reduce<ExplorerState>((acc, f) => ({ ...acc, [f.id]: { ...acc[f.id], metadata: f } }), {}),
        };
        console.debug(newState);
        return newState;
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
