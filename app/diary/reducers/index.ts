/*
  Reducers for Diary (aka homework) app.
*/

import { combineReducers } from "redux";

import list from "./list";
import selected from "./selected";
import selectedTask from "./selectedTask";
import tasks from "./tasks";

const rootReducer = combineReducers({
  list,
  selected,
  selectedTask,
  tasks
});

export default rootReducer;
