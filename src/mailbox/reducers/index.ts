import { combineReducers } from "redux";

import { IConversationMessageList, IConversationMessage } from "../actions/sendMessage";
import messages from "./messages";
import threadList, { IConversationThread, IConversationThreadList } from "./threadList";
import threadSelected from "./threadSelected";
import receiversDisplay, { IConversationReceiverList } from "./receiversDisplay";
import users from "./users";
import subject from "./subject";

const rootReducer = combineReducers({
  messages,
  threadList,
  threadSelected,
  receiversDisplay,
  users,
  subject
});
export { IConversationMessageList, IConversationMessage, IConversationReceiverList, IConversationThread, IConversationThreadList }
export default rootReducer;
