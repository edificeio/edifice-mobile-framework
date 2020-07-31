import { combineReducers } from "redux";

import folders from "./folders";
import mailContent from "./mailContent";
import mailList from "./mailList";
import quota from "./quota";

const rootReducer = combineReducers({
  mailList,
  folders,
  quota,
  mailContent,
});
export default rootReducer;
