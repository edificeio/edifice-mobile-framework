import { combineReducers } from 'redux';

import moduleConfig from './module-config';

import {
  createExplorerActions,
  createExplorerReducer,
  createExplorerSelectors,
  ExplorerState,
} from '~/framework/modules/explorer/store';

export interface WikiStore {
  explorer: ExplorerState;
}

export const reducer = combineReducers({
  explorer: createExplorerReducer(moduleConfig),
});

export const actions = {
  explorer: createExplorerActions(moduleConfig),
};

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
};
