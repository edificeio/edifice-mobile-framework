/*
  Reducers for Homework app.
*/

import { combineReducers } from "redux";

import diaryList from "./diaryList";
import selectedDiary from "./selectedDiary";
import selectedTask from "./selectedTask";
import tasks from "./tasks";

const rootReducer = combineReducers({
  diaryList,
  selectedDiary,
  selectedTask,
  tasks
});

export default rootReducer;
