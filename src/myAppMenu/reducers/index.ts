import { combineReducers } from "redux";

import notificationList from "./notificationList";

const rootReducer = combineReducers({
  notificationList,
});
export default rootReducer;
