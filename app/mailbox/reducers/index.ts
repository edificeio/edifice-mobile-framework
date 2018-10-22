import { combineReducers } from "redux";

import filter from "./filter";
import messages from "./messages";
import threadList from "./threadList";
import threadSelected from "./threadSelected";

const rootReducer = combineReducers({
  filter,
  messages,
  threadList,
  threadSelected
});

export default rootReducer;
