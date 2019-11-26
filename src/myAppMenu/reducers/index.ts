import { combineReducers } from "redux";

import emptyReducer from "./emptyReducer";
import notificationList from "./notificationList";

const rootReducer = combineReducers({
  emptyReducer,
  notificationList,
});
export default rootReducer;
