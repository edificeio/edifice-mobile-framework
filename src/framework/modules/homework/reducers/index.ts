/*
  Reducers for Homework app.
*/
import { combineReducers } from 'redux';

import diaryList from './diaryList';
import selectedDiary from './selectedDiary';
import tasks from './tasks';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/homework/module-config';

const reducer = combineReducers({
  diaryList,
  selectedDiary,
  tasks,
});

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
