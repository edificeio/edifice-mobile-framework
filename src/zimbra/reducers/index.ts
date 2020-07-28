import { combineReducers } from "redux";

import folders from "./folders";
import mailList from "./mailList";
import quota from "./quota";

const rootReducer = combineReducers({
  mailList,
  folders,
  quota,
});
export default rootReducer;
