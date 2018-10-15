/**
 * Conversation messages actions
 * Build actions to be dispatched to the conversarion messages reducer.
 */
import moment from "moment";

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import conversationConfig from "../config";

import { IConversationMessageList } from "../reducers/messages";

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

const conversationMessagesAdapter: (
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

/**
 * Calls a fetch operation to get older conversation messages from the backend for a given thread.
 * Dispatches CONVERSATION_MESSAGES_REQUESTED, CONVERSATION_MESSAGES_RECEIVED, and CONVERSATION_MESSAGES_FETCH_ERROR if an error occurs.
 */
export function fetchPreviousConversationMessages(threadId: string) {
  return async (dispatch, getState) => {
    // Check if we try to reload a page
    console.log(
      `fetchConversationThreadMessages (messageId=${threadId})`,
      localState(getState())
    );

    dispatch(conversationMessagesRequested());

    const oldestMessageId = false;

    try {
      const data = await asyncGetJson(
        `/conversation/thread/previous-messages/${oldestMessageId}`,
        conversationMessagesAdapter
      );
      console.log("older messages fetched: ", data);

      dispatch(conversationMessagesReceived(data));
    } catch (errmsg) {
      dispatch(conversationMessagesFetchError(errmsg));
    }
  };
}
