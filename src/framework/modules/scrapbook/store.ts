import { combineReducers, Reducer } from 'redux';

import moduleConfig from './module-config';
import { createExplorerActions, createExplorerReducer, createExplorerSelectors, ExplorerState } from '../explorer/store';

export interface ScrapbookStore {
  explorer: ExplorerState;
}

export default combineReducers({
  explorer: createExplorerReducer(moduleConfig),
}) as unknown as Reducer<ScrapbookStore>;

export const actions = {
  explorer: createExplorerActions(moduleConfig),
};

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
};
