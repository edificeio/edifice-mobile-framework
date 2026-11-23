/**
 * Action types and action creators of `explorer`: what happened, for the reducer. Each action names the app its data belongs to.
 */
import type { ExplorerApp, ExplorerPageData, FolderId } from '~/framework/modules/explorer/model/types';

export const explorerActionTypes = {
  loadPage: 'EXPLORER_LOAD_PAGE',
} as const;

export const explorerActions = {
  loadPage: (app: ExplorerApp, folderId: FolderId, data: ExplorerPageData, flushPreviousData: boolean = false) => ({
    app,
    flushPreviousData,
    folderId,
    type: explorerActionTypes.loadPage,
    ...data,
  }),
};

export type ExplorerAction = ReturnType<(typeof explorerActions)[keyof typeof explorerActions]>;
