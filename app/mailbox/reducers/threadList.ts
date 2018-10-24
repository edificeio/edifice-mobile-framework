/**
 * Conversation thread list state reducer
 */
import moment from "moment";

import { IOrderedArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import {
  actionTypeAppendReceived,
  actionTypeAppendRequested,
  actionTypeResetReceived,
  actionTypeResetRequested,
  actionTypes,
  actionTypeSetRead,
  NB_THREADS_PER_PAGE
} from "../actions/threadList";
import { IConversationMessage } from "./messages";
import { actionTypeMessageSendRequested, actionTypeMessageSent } from "../actions/sendMessage";
import { actionTypeThreadCreated } from "../actions/createThread";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IConversationThread {
  id: string; // Id of the first (oldest) message in this thread
  subject: string; // Short descrption
  date: moment.Moment; // Date of the most recent message in the thread
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this thread (newest message).
  unread: number; // nb of unread messages
  to: string[]; // User Ids of the receivers (newest message)
  cc: string[]; // User Ids of the copy receivers (newest message)
  from: string; // User Id of the sender (newest message)
  messages: IConversationMessage[]; // Messages id in this thread (recent first). They have to be manually ordered.
  isFetchingOlder: boolean;
  isFetchingNewer: boolean;
}

export type IConversationThreadList = IOrderedArrayById<IConversationThread> & {
  page?: number;
  isRefreshing?: boolean; // isRefreshing is not as the same level of isFetching, but it's more practical this way.
};

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationThreadList = {
  byId: {},
  ids: [],
  isRefreshing: false,
  page: -1
};

const conversationThreadListReducer = (
  state: IConversationThreadList = stateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      // action contains `page`, `data`, `receivedAt` (not used)
      return {
        ...state,
        byId: { ...state.byId, ...action.data.byId },
        ids: [
          ...state.ids.slice(0, NB_THREADS_PER_PAGE * action.page),
          ...action.data.ids,
          ...state.ids.slice(NB_THREADS_PER_PAGE * (action.page + 1))
        ],
        page: action.page
      };
    case actionTypeResetRequested:
      return {
        ...state,
        isRefreshing: true
      };
    case actionTypeResetReceived:
      return {
        byId: { ...action.data.byId },
        ids: [...action.data.ids],
        isRefreshing: false,
        page: 0
      };
    case actionTypeAppendRequested:
      // action contains `threadId`, `isNew`
      // console.log("reducer: append requested", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.threadId]: {
            ...state.byId[action.threadId],
            [action.isNew ? "isFetchingNewer" : "isFetchingOlder"]: true
          }
        }
      };
    case actionTypeAppendReceived:
      // action contains `data`, `threadId`, `isNew`
      // console.log("reducer: append received", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.threadId]: {
            ...state.byId[action.threadId],
            messages: action.isNew
              ? [...action.data, ...state.byId[action.threadId].messages]
              : [...state.byId[action.threadId].messages, ...action.data],
            [action.isNew ? "isFetchingNewer" : "isFetchingOlder"]: false
          }
        }
      };
    case actionTypes.fetchError:
      // console.warn("reducer: fetch error", action.errmsg);
      return state;
    case actionTypeSetRead:
      // console.log("reducer: set thread read", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.threadId]: {
            ...state.byId[action.threadId],
            unread: 0
          }
        }
      };
    case actionTypeMessageSendRequested:
      // action contains `data: IConversationMessage`
      console.log("reducer: (threadList) send message request", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.data.threadId]: {
            ...state.byId[action.data.threadId],
            messages: [
              action.data.id,
              ...state.byId[action.data.threadId].messages
            ]
          }
        }
      };
    case actionTypeMessageSent:
      // action contains `data: IConversationMessage with oldId and newId instead of id`
      console.log("reducer: (threadList) send message request", action);
      const msglist = state.byId[action.data.threadId].messages;
      const index = msglist.indexOf(action.data.oldId);
      if (index !== -1) {
        msglist[index] = action.data.newId;
      }
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.data.threadId]: {
            ...state.byId[action.data.threadId],
            messages: msglist
          }
        }
      };
    case actionTypeThreadCreated:
      console.log("reducer (threadList): create thread");
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.newThread.id]: action.newThread
        },
        ids: [action.newThread.id, ...state.ids]
      };
    default:
      return state;
  }
};

export default asyncReducer<IConversationThreadList>(
  conversationThreadListReducer,
  actionTypes
);
