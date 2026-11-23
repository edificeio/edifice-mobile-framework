/**
 * Redux store of `explorer` (see `ExplorerState`). Emptied when the session ends.
 */
import { staleOrSplice } from '~/framework/components/list/paginated-list';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import { ExplorerAction, explorerActionTypes } from './action-creators';
import { ExplorerAppData, ExplorerState, initialState } from './state';

/** The action of a type: a handler only gets the actions of its type. */
type ActionOf<Type extends ExplorerAction['type']> = Extract<ExplorerAction, { type: Type }>;

// The reducer gets every action of the app (not only `ExplorerAction`): redux types the store from reducers that accept any action
const reducer = createSessionReducer<ExplorerState>(initialState, {
  [explorerActionTypes.loadPage]: (state, anyAction) => {
    const action = anyAction as ActionOf<typeof explorerActionTypes.loadPage>;
    const appState = state[action.app] ?? {};
    const newAppState: ExplorerAppData = {
      // Previous data
      ...appState,
      [action.folderId]: {
        ...appState[action.folderId],
        // Current folder (content)
        content: {
          folders: action.folders,
          resources: staleOrSplice({
            newData: action.resources,
            previousData: appState[action.folderId]?.content?.resources ?? [],
            reloadAll: action.flushPreviousData,
            start: action.pagination.pageStart,
            total: action.pagination.total,
          }),
        },
        // Current folder (metadata)
      },
      // children of current folder (metadata)
      ...action.folders.reduce<ExplorerAppData>((acc, f) => ({ ...acc, [f.id]: { ...acc[f.id], metadata: f } }), {}),
    };
    return { ...state, [action.app]: newAppState };
  },
});

export default reducer;

export * from './action-creators';
export * from './selectors';
export * from './state';
