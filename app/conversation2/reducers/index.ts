import { combineReducers } from "redux";

import messages from "./messages";
import threadList from "./threadList";
import threadSelected from "./threadSelected";

const rootReducer = combineReducers({
  messages,
  threadList,
  threadSelected
});

export default rootReducer;
