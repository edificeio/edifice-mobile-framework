import { combineReducers } from "redux";

import init from "./initMails";
import count from "./count"
import mailContent from "./mailContent";
import mailList from "./mailList";

const rootReducer = combineReducers({
  init,
  count,
  mailList,
  mailContent,
});
export default rootReducer;
