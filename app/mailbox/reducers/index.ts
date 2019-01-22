import { combineReducers } from "redux";

import filter from "./filter";
import messages, { IConversationMessageList, IConversationMessage } from "./messages";
import threadList from "./threadList";
import threadSelected from "./threadSelected";
import receiversDisplay from "./receiversDisplay";
import users from "./users";

const rootReducer = combineReducers({
  filter,
  messages,
  threadList,
  threadSelected,
  receiversDisplay,
  users
});
export { IConversationMessageList, IConversationMessage }
export default rootReducer;
