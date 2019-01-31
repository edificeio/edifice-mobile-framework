/**
 * Conversation messages state reducer
 * Flattened list of all loaded messages.
 */
import moment from "moment";

import { IArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import { actionTypes, actionTypeSetRead } from "../actions/messages";
import {
  actionTypeMessageSendError,
  actionTypeMessageSendRequested,
  actionTypeMessageSent,
  IConversationMessageList,
  ConversationMessageStatus
} from "../actions/sendMessage";
// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationMessageList = {};

const conversationThreadListReducer = (
  state: IConversationMessageList = stateDefault,
  action
) => {
  // console.log("REDUCER TEST", action.type);
  switch (action.type) {
    case actionTypes.received:
      // action contains, `data`, `receivedAt` (not used)
      // console.log("reducer : messages data merged.");
      return {
        ...state,
        ...action.data // if a message already exists with its Id, it is replaced.
      };
    case actionTypeSetRead:
      // action contains, `messageIds`
      // console.log("reducer : messages data marked as read.");
      const result = { ...state };
      for (const messageId of action.messageIds) {
        result[messageId].unread = false;
      }
      return result;
    case actionTypeMessageSendRequested:
      // action contains `data: IConversationMessage`
      // console.log("reducer: (messages) send message request", action);
      return {
        ...state,
        [action.data.id]: action.data
      };
    case actionTypeMessageSent:
      // action contains, `data: IConversationMessage (with newId and oldId instead of id)`
      //console.log("reducer: (messages) send message ok", action);
      const result2 = { ...state };
      result2[action.data.newId] = result2[action.data.oldId];
      result2[action.data.newId].status = ConversationMessageStatus.sent;
      result2[action.data.newId].id = action.data.newId;
      result2[action.data.newId].to = action.data.to;
      delete result2[action.data.oldId];
      return result2;
    case actionTypeMessageSendError:
      // action contains, `data: IConversationMessage`
      // console.log("reducer: (messages) send message error", action);
      const result3 = { ...state };
      result3[action.data.oldId].to = action.data.to;
      result3[action.data.oldId].status = ConversationMessageStatus.failed;
      return result3;
    default:
      return state;
  }
};

export default asyncReducer<IConversationMessageList>(
  conversationThreadListReducer,
  actionTypes
);
