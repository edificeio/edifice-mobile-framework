/*
  Reducers for Homework app.
*/
import { combineReducers } from 'redux';

import { createExplorerActions, createExplorerReducer, createExplorerSelectors } from '~/framework/modules/explorer/store';
import moduleConfig from '~/framework/modules/homework/module-config';

import diaryList from './diaryList';
import selectedDiary from './selectedDiary';
import tasks from './tasks';

export const reducer = combineReducers({
  diaryList,
  explorer: createExplorerReducer(moduleConfig),
  selectedDiary,
  tasks,
});

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
};

export const actions = {
  explorer: createExplorerActions(moduleConfig),
};
