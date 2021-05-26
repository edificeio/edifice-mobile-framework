/**
 * Conversation thread list actions
 * Build actions to be dispatched to the conversarion thread list reducer.
 */
import moment from "moment";

import { asyncActionTypes, asyncGetJson } from "../../infra/redux/async";
import conversationConfig from "../config";
import {
  IConversationMessageList
} from "./sendMessage";
import { IConversationThread, IConversationThreadList } from "../reducers/threadList";
import {
  conversationMessagesFetchError,
  conversationMessagesReceived,
  conversationMessagesRequested,
  conversationOrderedMessagesAdapter,
} from "./messages";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";

export const NB_THREADS_PER_PAGE = 10; // Needs to be the same value as the backend's one

/** Returns the local state (global state -> conversation2 -> threadList). Give the global state as parameter. */
const localState = globalState =>
  conversationConfig.getLocalState(globalState).threadList;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IConversationThreadListBackend = Array<{
  cc: string[]; // User Ids of the copy receivers
  date: number; // DateTime of the message
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  from: string; // User id of the sender
  id: string; // Message's own id
  subject: string; // Subject of the message
  to: string[]; // User Ids of the receivers
  unread: number; // Nbr of unread messages in this thread
}>;

const conversationThreadListAdapter: (
  data: IConversationThreadListBackend
) => IConversationThreadList = data => {
  const result = {
    byId: {},
    ids: []
  };

  if(!data) {
    return result
  }

  for (const thread of data) {
    // 1, For each thread, extract thread info in `result.threads`
    result.byId[thread.id] = {
      cc: thread.cc,
      date: moment(thread.date),
      displayNames: thread.displayNames,
      from: thread.from,
      id: thread.id,
      isFetchingNewer: false,
      isFetchingFirst: false,
      isFetchingOlder: false,
      messages: [],
      subject: thread.subject && thread.subject.trim(), // TODO : do this at display time, not load time.
      to: thread.to,
      unread: thread.unread
    };
    result.ids.push(thread.id);
    // 2, Sort each thread by last message date, backend result is f*cked-up
    result.ids.sort((a: string, b: string) =>
      result.byId[b].date.diff(result.byId[a].date)
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

export const actionTypeAppendRequested =
  conversationConfig.createActionType("THREAD") + "_APPEND_REQUESTED";
export const actionTypeAppendReceived =
  conversationConfig.createActionType("THREAD") + "_APPEND_RECEIVED";

export function conversationThreadAppendRequested(
  threadId: string,
  isNew: boolean
) {
  return { type: actionTypeAppendRequested, threadId, isNew };
}
export function conversationThreadAppendReceived(
  data: string[],
  threadId: string,
  isNew: boolean
) {
  return { type: actionTypeAppendReceived, data, threadId, isNew };
}

export const actionTypeThreadResetRequested =
  conversationConfig.createActionType("THREAD_LIST") +
  "_THREAD_RESET_REQUESTED";
export const actionTypeThreadResetReceived =
  conversationConfig.createActionType("THREAD_LIST") + "_THREAD_RESET_RECEIVED";

export function conversationThreadResetRequested(threadId: string) {
  return { type: actionTypeThreadResetRequested, threadId };
}
export function conversationThreadResetReceived(
  data: string[],
  threadId: string
) {
  return { type: actionTypeThreadResetReceived, data, threadId };
}

export const actionTypeSetRead =
  conversationConfig.createActionType("THREAD") + "_SET_READ";
export function conversationThreadSetRead(threadId: string) {
  return { type: actionTypeSetRead, threadId };
}

export const actionTypeThreadDeleted =
  conversationConfig.createActionType("THREAD") + "_DELETED";
export function conversationThreadDeleted(threadId: string) {
  return { type: actionTypeThreadDeleted, threadId };
}

export const actionTypeThreadInserted =
  conversationConfig.createActionType("THREAD") + "_INSERTED";
export function conversationThreadInserted(threadInfos: IConversationThread) {
  return {type: actionTypeThreadInserted, data: threadInfos }
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get conversation thread list from the backend.
 * Dispatches CONVERSATION_THREAD_LIST_REQUESTED, CONVERSATION_THREAD_LIST_RECEIVED, and CONVERSATION_THREAD_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchConversationThreadList(page: number = 0) {
  return async (dispatch, getState) => {
    // Check if we try to reload a page
    const threadListinfo = localState(getState());
    if (threadListinfo.isFetching) {
      // Don't fetch new page if already fetching
      // throw new Error("Conversation: Won't fetch, already fetching.");
      return;
    }
    if (threadListinfo.data.end) return;
    if (page <= localState(getState()).data.page) {
      const error = new Error(
        "Conversation: Won't fetch a page that has already been recevied."
      );
      (error as any).type = "ALREADY_FETCHED";
      throw error;
    }

    dispatch(conversationThreadListRequested());
    try {
      const data = await asyncGetJson(
        `/conversation/threads/list?page=${page}`,
        conversationThreadListAdapter
      );
      // A thread's messages might already be loaded after opening a timeline notification,
      // so we need to make sure the data (which might include the thread) doesn't delete them
      const dataIds = data.ids;
      const threadListinfoById = threadListinfo.data.byId;
      const threadListinfoByIdKeys =  threadListinfoById && Object.keys(threadListinfoById);
      const idsAlreadyLoaded = dataIds && threadListinfoByIdKeys && dataIds.filter(id => threadListinfoByIdKeys.includes(id));
      idsAlreadyLoaded && idsAlreadyLoaded.forEach(e => data.byId[e].messages = threadListinfoById[e].messages);

      dispatch(conversationThreadListReceived(page, data)); // threads with message ids
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
      dispatch(conversationThreadListResetReceived(data)); // thread infos
    } catch (errmsg) {
      console.warn(errmsg);
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}

export function fetchConversationThreadAllMessages(threadId: string) {
  return async (dispatch, getState) => {
    try {
      dispatch(conversationMessagesRequested());

      // Fetch data
      const data = await asyncGetJson(
        `/conversation/thread/messages/${threadId}`,
        conversationOrderedMessagesAdapter
      );
      if (data.length === 0) throw new Error("Thread deleted");

      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      for (const message of data) {
        messages[message.id] = message;
      }
      const messageIds = data.map(message => message.id);
      const firstMessage = data && data[0];
      const subject = firstMessage?.subject;
      const date = firstMessage?.date;
      const displayNames = firstMessage?.displayNames;
      const to = firstMessage?.to;
      const cc = firstMessage?.cc;
      const from = firstMessage?.from;
      const threadListData = {
        id: threadId,
        subject,
        date,
        displayNames,
        unread: 0,
        to,
        cc,
        from,
        messages: [...messageIds],
        isFetchingOlder: false,
        isFetchingNewer: false,
        isFetchingFirst: false
      } as IConversationThread;

      // dispatch
      dispatch(conversationMessagesReceived(messages)); // message contents
      dispatch(conversationThreadInserted(threadListData)); // thread infos
      return data;
    } catch (errmsg) {
      dispatch(conversationMessagesFetchError(errmsg));
      return errmsg;
    }
  };
}

export function fetchConversationThreadOlderMessages(threadId: string) {
  return async (dispatch, getState) => {
    try {
      const threadInfo = localState(getState()).data.byId[threadId];
      if (threadInfo.isFetchingOlder) return; // No fetch is already fetching, it's important, otherwise, there will maybe have doublons

      dispatch(conversationThreadAppendRequested(threadId, false));
      // Get the oldest known messageId
      const oldestMessageId =
        threadInfo.messages[threadInfo.messages.length - 1];
      /*console.log(
        `fetching older messages of ${threadId}, last message : ${oldestMessageId}`
      );*/
      // Fetch data
      const data = await asyncGetJson(
        `/conversation/thread/previous-messages/${oldestMessageId}`,
        conversationOrderedMessagesAdapter
      );
      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      for (const message of data) {
        messages[message.id] = message;
      }
      const messageIds = data.map(message => message.id);
      // console.log("thread older messages received: ", messages, messageIds);
      // dispatch
      dispatch(conversationMessagesReceived(messages)); // message contents
      dispatch(conversationThreadAppendReceived(messageIds, threadId, false)); // messages ids ordered
    } catch (errmsg) {
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}

export function fetchConversationThreadNewerMessages(threadId: string) {
  return async (dispatch, getState) => {
    try {
      const threadInfo = localState(getState()).data.byId[threadId];
      if (threadInfo.isFetchingNewer) return; // No fetch is already fetching, it's important, otherwise, there will maybe have doublons

      dispatch(conversationThreadAppendRequested(threadId, true));
      // Get the newest known messageId
      const newestMessageId = threadInfo.messages[0];
      /*console.log(
        `fetching newer messages of ${threadId}, last message : ${newestMessageId}`
      );*/
      // Fetch data
      const data = await asyncGetJson(
        `/conversation/thread/new-messages/${newestMessageId}`,
        conversationOrderedMessagesAdapter
      );
      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      for (const message of data) {
        messages[message.id] = message;
      }
      const messageIds = data.map(message => message.id);
      // console.log("thread newer messages received: ", messages, messageIds);
      // dispatch
      dispatch(conversationMessagesReceived(messages)); // message contents
      dispatch(conversationThreadAppendReceived(messageIds, threadId, true)); // messages ids ordered
      dispatch(conversationSetThreadRead(threadId, true));
    } catch (errmsg) {
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}

export function fetchConversationThreadResetMessages(threadId: string) {
  return async (dispatch, getState) => {
    try {
      const threadInfo = localState(getState()).data.byId[threadId];
      dispatch(conversationThreadResetRequested(threadId));
      // Fetch data
      const data = await asyncGetJson(
        `/conversation/thread/messages/${threadId}`,
        conversationOrderedMessagesAdapter
      );
      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      for (const message of data) {
        messages[message.id] = message;
      }
      const messageIds = data.map(message => message.id);
      // console.log("thread newer messages received: ", messages, messageIds);
      // dispatch
      dispatch(conversationMessagesReceived(messages)); // message contents
      dispatch(conversationThreadResetReceived(messageIds, threadId)); // messages ids ordered
      dispatch(conversationSetThreadRead(threadId, true));
    } catch (errmsg) {
      dispatch(conversationThreadListFetchError(errmsg));
    }
  };
}

export function conversationSetThreadRead(threadId: string, force?: boolean) {
  force = force || false; // Note : when this method is called on thread refresh, thread information about unread messages is 0. So we have to force marking as read.
  return async (dispatch, getState) => {
    const threadInfo = localState(getState()).data.byId[threadId];
    // console.log("toggle unread ?", threadId, threadInfo);
    if (!force && !threadInfo.unread) return;
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      // console.log("YES TOGGLE UNRAD");
      const response = await signedFetch(
        `${Conf.currentPlatform.url}/conversation/thread/toggleUnread`,
        {
          body: JSON.stringify({
            id: [threadId],
            unread: false
          }),
          method: "POST"
        }
      );
      dispatch(conversationThreadSetRead(threadId));
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("failed to mark thread read : ", threadId);
    }
  };
}

export function conversationDeleteThread(threadId: string) {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const response = await signedFetch(
        `${Conf.currentPlatform.url}/conversation/thread/trash`,
        {
          body: JSON.stringify({
            id: [threadId]
          }),
          method: "PUT"
        }
      );
      dispatch(conversationThreadDeleted(threadId));
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("failed to mark thread deleted : ", threadId);
    }
  };
}
