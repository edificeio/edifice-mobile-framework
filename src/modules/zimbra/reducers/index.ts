import { combineReducers } from "redux";

import init from "./initMails";
import mailContent from "./mailContent";
import mailList from "./mailList";
import quota from "./quota";
import rootFolders from "./rootFolders";
import signature from "./signature";

const rootReducer = combineReducers({
  init,
  rootFolders,
  mailList,
  quota,
  mailContent,
  signature,
});
export default rootReducer;
