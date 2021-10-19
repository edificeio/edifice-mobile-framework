import { combineReducers } from "redux";

import init from "./initMails";
import mailContent from "./mailContent";
import mailList from "./mailList";
import rootFolders from "./rootFolders";

const rootReducer = combineReducers({
  init,
  rootFolders,
  mailList,
  mailContent,
});
export default rootReducer;
