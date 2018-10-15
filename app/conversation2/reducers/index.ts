import { combineReducers } from "redux";

import messages from "./messages";
import threadList from "./threadList";

const rootReducer = combineReducers({
  messages,
  threadList
});

export default rootReducer;
