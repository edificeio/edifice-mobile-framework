/*
  Reducers for Homework (aka Diary) app.
*/

import { combineReducers } from "redux";

import diaryTasks from "./diaryTasks";

const rootReducer = combineReducers({
  diaryTasks
});

export default rootReducer;
