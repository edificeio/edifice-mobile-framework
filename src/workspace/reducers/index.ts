import { combineReducers } from "redux";

import { IConversationMessageList, IConversationMessage } from "../actions/sendMessage";
import messages from "./messages";
import threadList, { IConversationThread, IConversationThreadList } from "./list";
import threadSelected from "./threadSelected";
import receiversDisplay, { IConversationReceiverList } from "./receiversDisplay";
import users from "./users";

const rootReducer = combineReducers({
  messages,
  threadList,
  threadSelected,
  receiversDisplay,
  users
});
export { IConversationMessageList, IConversationMessage, IConversationReceiverList, IConversationThread, IConversationThreadList }
export default rootReducer;
