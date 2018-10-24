import { combineReducers } from "redux";

import filter from "./filter";
import messages from "./messages";
import threadList from "./threadList";
import threadSelected from "./threadSelected";
import users from "./users";

const rootReducer = combineReducers({
  filter,
  messages,
  threadList,
  threadSelected,
  users
});

export default rootReducer;
