/**
 * Conversation messages actions
 * Build actions to be dispatched to the conversarion messages reducer.
 */
import moment from "moment";

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import conversationConfig from "../config";

import {
  IConversationMessageList,
  IConversationMessageNativeArray
} from "../reducers/messages";

/** Returns the local state (global state -> conversation2 -> messages). Give the global state as parameter. */
const localState = globalState =>
  conversationConfig.getLocalState(globalState).messages;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IConversationMessageListBackend = Array<{
  id: string;
  parent_id: string;
  subject: string;
  body: string;
  from: string; // User id of the sender
  fromName: string; // Name of the sender
  to: string[]; // User Ids of the receivers
  toName: string[]; // Name of the receivers
  cc: string[]; // User Ids of the copy receivers
  ccName: string[]; // Name of the copy receivers
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  date: number;
  thread_id: string;
  unread: boolean;
}>;

/**
 * Used when the data doesn't need to be ordered, but you want to merge a array in messages in another.
 */
export const conversationMessagesAdapter: (
  data: IConversationMessageListBackend
) => IConversationMessageList = data => {
  const result = {};
  for (const message of data) {
    result[message.id] = {
      ...message,
      date: moment(message.date),
      parentId: message.parent_id,
      threadId: message.thread_id
    };
  }
  return result;
};

/**
 * Used when you want to keep the returned data order.
 */
export const conversationOrderedMessagesAdapter: (
  data: IConversationMessageListBackend
) => IConversationMessageNativeArray = data => {
  return data.map(message => ({
    ...message,
    date: moment(message.date),
    parentId: message.parent_id,
    rownum: undefined,
    status: undefined,
    threadId: message.thread_id
  }));
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(
  conversationConfig.createActionType("MESSAGES")
);

export function conversationMessagesInvalidated() {
  return { type: actionTypes.invalidated };
}

export function conversationMessagesRequested() {
  return { type: actionTypes.requested };
}

export function conversationMessagesReceived(data: IConversationMessageList) {
  return { type: actionTypes.received, data, receivedAt: Date.now() };
}

export function conversationMessagesFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

// No thunk.
