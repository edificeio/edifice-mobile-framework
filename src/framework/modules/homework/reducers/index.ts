/*
  Reducers for Homework app.
*/
import { combineReducers } from 'redux';

import diaryList from './diaryList';
import selectedDiary from './selectedDiary';
import tasks from './tasks';

import { Reducers } from '~/app/store';
import { createExplorerActions, createExplorerReducer, createExplorerSelectors } from '~/framework/modules/explorer/store';
import moduleConfig from '~/framework/modules/homework/module-config';

export const reducer = combineReducers({
  diaryList,
  explorer: createExplorerReducer(moduleConfig),
  selectedDiary,
  tasks,
});

export default Reducers.register(moduleConfig.reducerName, reducer);

export const selectors = {
  explorer: createExplorerSelectors(moduleConfig, state => moduleConfig.getState(state).explorer),
};

export const actions = {
  explorer: createExplorerActions(moduleConfig),
};
