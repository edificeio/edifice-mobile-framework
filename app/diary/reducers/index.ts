/*
  Reducers for Diary (aka homework) app.
*/

import { combineReducers } from "redux";

import list from "./list";
import selected from "./selected";
import tasks from "./tasks";

const rootReducer = combineReducers({
  list,
  selected,
  tasks
  // selectedTask
});

export default rootReducer;
