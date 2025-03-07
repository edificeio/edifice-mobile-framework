import { combineReducers } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { Wiki } from './model';
import moduleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import {
  createExplorerActions,
  createExplorerReducer,
  createExplorerSelectors,
  ExplorerState,
} from '~/framework/modules/explorer/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

export type WikiAction = { type: `${string}_LOAD_WIKI`; data: Wiki };

const wikiActionTypes = {
  LOAD_WIKI: moduleConfig.namespaceActionType('LOAD_WIKI') as `${string}_LOAD_WIKI`,
};

export interface WikiStore {
  explorer: ExplorerState;
  wikis: Record<Wiki['assetId'], Wiki>;
  pages: object;
}

export const wikisReducer = createSessionReducer<WikiStore['wikis'], WikiAction>(
  {},
  {
    [wikiActionTypes.LOAD_WIKI]: (state, action) => ({ ...state, [action.data.assetId]: action.data }),
  },
);

export const reducer = combineReducers({
  explorer: createExplorerReducer(moduleConfig),
  wikis: wikisReducer,
});

export const actions = {
  explorer: createExplorerActions(moduleConfig),
  loadWiki:
    (data: Wiki): ThunkAction<void, IGlobalState, object, WikiAction> =>
    dispatch => {
      dispatch({ data, type: wikiActionTypes.LOAD_WIKI });
    },
};

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
  wiki: (id: keyof WikiStore['wikis']) => (state: IGlobalState) => moduleConfig.getState(state).wikis[id],
};
