import { combineReducers } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { Wiki, WikiPage } from './model';
import moduleConfig from './module-config';

import { IGlobalState } from '~/app/store';
import {
  createExplorerActions,
  createExplorerReducer,
  createExplorerSelectors,
  ExplorerState,
} from '~/framework/modules/explorer/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

const wikiActionTypes = {
  LOAD_PAGE: moduleConfig.namespaceActionType('LOAD_PAGE') as `${string}_LOAD_PAGE`,
  LOAD_WIKI: moduleConfig.namespaceActionType('LOAD_WIKI') as `${string}_LOAD_WIKI`,
};

export type WikiAction = { type: `${string}_LOAD_WIKI`; data: Wiki };
export type WikiPageAction = { type: `${string}_LOAD_PAGE`; data: WikiPage };

export interface WikiStore {
  explorer: ExplorerState;
  wikis: Record<Wiki['assetId'], Wiki>;
  pages: Record<WikiPage['id'], WikiPage>;
}

export const wikisReducer = createSessionReducer<WikiStore['wikis'], WikiAction>(
  {},
  {
    [wikiActionTypes.LOAD_WIKI]: (state, action) => ({ ...state, [action.data.assetId]: action.data }),
  },
);
export const wikisPagesReducer = createSessionReducer<WikiStore['pages'], WikiPageAction>(
  {},
  {
    [wikiActionTypes.LOAD_PAGE]: (state, action) => ({ ...state, [action.data.id]: action.data }),
  },
);

export const reducer = combineReducers({
  explorer: createExplorerReducer(moduleConfig),
  pages: wikisPagesReducer,
  wikis: wikisReducer,
});

export const actions = {
  explorer: createExplorerActions(moduleConfig),
  loadPage:
    (wikiId: Wiki['assetId'], data: WikiPage): ThunkAction<void, IGlobalState, object, WikiPageAction> =>
    dispatch => {
      dispatch({ data, type: wikiActionTypes.LOAD_PAGE });
    },
  loadWiki:
    (data: Wiki): ThunkAction<void, IGlobalState, object, WikiAction> =>
    dispatch => {
      dispatch({ data, type: wikiActionTypes.LOAD_WIKI });
    },
};

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
  page: (id: keyof WikiStore['pages']) => (state: IGlobalState) => moduleConfig.getState(state).pages[id],
  wiki: (id: keyof WikiStore['wikis']) => (state: IGlobalState) => moduleConfig.getState(state).wikis[id],
};
