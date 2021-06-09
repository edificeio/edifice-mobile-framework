import { combineReducers } from "redux";

import init from "./initMails";
import mailContent from "./mailContent";
import mailList from "./mailList";

const rootReducer = combineReducers({
  init,
  mailList,
  mailContent,
});
export default rootReducer;
