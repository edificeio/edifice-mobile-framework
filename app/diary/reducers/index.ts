/*
  Reducers for Diary (aka homework) app.
*/

import { combineReducers } from "redux";

import list from "./list";
import selected from "./selected";

const rootReducer = combineReducers({
  list,
  selected
  // selectedTask
});

export default rootReducer;
