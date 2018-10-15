/**
 * Conversation thread list actions
 * Build actions to be dispatched to the conversarion thread list reducer.
 */
import moment from "moment";

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import conversationConfig from "../config";

import { IArrayById } from "../../infra/collections";
import { IConversationMessage } from "../reducers/messages";
import { IConversationThreadList } from "../reducers/threadList";
import { conversationMessagesReceived } from "./messages";

export const NB_THREADS_PER_PAGE = 10; // Needs to be the same value as the backend's one

/** Returns the local state (global state -> conversation2 -> threadList). Give the global state as parameter. */
const localState = globalState =>
  conversationConfig.getLocalState(globalState).threadList;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IConversationThreadListBackend = Array<
  // Double-array: A thread is an array of messages. Backend serves an array of threads.
  Array<{
    id: string; // Message's own id
    parent_id: string; // Id of the message that it reply to
    subject: string; // Subject of the message
    body: string; // Content of the message. It's HTML.
    from: string; // User id of the sender
    fromName: string; // Name of the sender
    to: string[]; // User Ids of the receivers
    toName: string[]; // Name of the receivers
    cc: string[]; // User Ids of the copy receivers
    ccName: string[]; // Name of the copy receivers
    displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
    date: number; // DateTime of the message
    thread_id: string; // Id of the thread (Id of the first message in this thread).
    unread: boolean; // Self-explaining
    rownum: number; // number of the message in the thread (starting from 1 from the newest to the latest).
  }>
>;

const conversationThreadListAdapter: (
  data: IConversationThreadListBackend
) => {
  messages: IArrayById<IConversationMessage>;
  threads: IConversationThreadList;
} = data => {
  const result = {
    messages: {},
    threads: {
      byId: {},
      ids: []
    }
  };

  for (const thread of data) {
    // 1, For each thread, extract thread info in `result.threads`
    const newestMessage = thread[0];
    result.threads.byId[newestMessage.thread_id] = {
      cc: newestMessage.cc,
      date: moment(newestMessage.date),
      displayNames: newestMessage.displayNames,
      from: newestMessage.from,
      id: newestMessage.thread_id,
      subject: newestMessage.subject,
      to: newestMessage.to,
      unread: 0
    };
    result.threads.ids.push(newestMessage.thread_id);
    // 2, Then extract all messages and put them flattened in `result.messages`
    for (const message of thread) {
      result.messages[message.id] = {
        ...message,
        date: moment(message.date),
        parentId: message.parent_id,
        threadId: message.thread_id
      };
      if (message.unread) ++result.threads.byId[message.thread_id].unread;
    }
    // 3, Sort each thread by last message date, backend result is f*cked-up
    result.threads.ids.sort((a: string, b: string) =>
      result.threads.byId[b].date.diff(result.threads.byId[a].date)
    );
  }

  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(
  conversationConfig.createActionType("THREAD_LIST")
);

export function conversationThreadListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function conversationThreadListRequested() {
  return { type: actionTypes.requested };
}

export function conversationThreadListReceived(
  page: number,
  data: IConversationThreadList
) {
  return { type: actionTypes.received, page, data, receivedAt: Date.now() };
}

export function conversationThreadListFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

export const actionTypeResetRequested =
  conversationConfig.createActionType("THREAD_LIST") + "_RESET_REQUESTED";
export const actionTypeResetReceived =
  conversationConfig.createActionType("THREAD_LIST") + "_RESET_RECEIVED";

export function conversationThreadListResetRequested() {
  return { type: actionTypeResetRequested };
}
export function conversationThreadListResetReceived(
  data: IConversationThreadList
) {
  return { type: actionTypeResetReceived, data };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get conversation thread list from the backend.
 * Dispatches CONVERSATION_THREAD_LIST_REQUESTED, CONVERSATION_THREAD_LIST_RECEIVED, and CONVERSATION_THREAD_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchConversationThreadList(page: number = 0) {
  return async (dispatch, getState) => {
    // Check if we try to reload a page
    console.log(
      `fetchConversationThreadList (page=${page})`,
      localState(getState())
    );
    if (localState(getState()).isFetching) {
      // Don't fetch new page if already fetching
      throw new Error("Conversation: Won't fetch, already fetching.");
    }
    if (page <= localState(getState()).data.page) {
      throw new Error(
        "Conversation: Won't fetch a page that has already been recevied."
      );
    }

    dispatch(conversationThreadListRequested());

    try {
      const data = await asyncGetJson(
        `/conversation/threads/list?page=${page}`,
        conversationThreadListAdapter
      );
      const { messages, threads } = data;
      console.log("thread list fetched: ", data);

      dispatch(conversationThreadListReceived(page, threads)); // threads with message ids
      dispatch(conversationMessagesReceived(messages)); // message contents
      console.log("global state", getState());
    } catch (errmsg) {
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}

export function resetConversationThreadList() {
  return async (dispatch, getState) => {
    dispatch(conversationThreadListResetRequested());
    try {
      const data = await asyncGetJson(
        `/conversation/threads/list?page=0`,
        conversationThreadListAdapter
      );
      const { messages, threads } = data;
      console.log("thread list fetched for reset: ", data);
      dispatch(conversationThreadListResetReceived(threads)); // threads with message ids
      dispatch(conversationMessagesReceived(messages)); // message contents
    } catch (errmsg) {
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}