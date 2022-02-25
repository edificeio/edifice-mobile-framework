/*
  Reducers for Homework app.
*/

import { combineReducers } from 'redux';

import diaryList from './diaryList';
import selectedDiary from './selectedDiary';
import tasks from './tasks';

const rootReducer = combineReducers({
  diaryList,
  selectedDiary,
  tasks,
});

export default rootReducer;
