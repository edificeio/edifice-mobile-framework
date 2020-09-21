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
  NB_THREADS_PER_PAGE,
  actionTypeThreadResetRequested,
  actionTypeThreadResetReceived,
  actionTypeThreadDeleted
} from "../actions/threadList";
import { actionTypeMessageSendRequested, actionTypeMessageSent } from "../actions/sendMessage";
import { actionTypeThreadCreated } from "../actions/createThread";
import { AnyAction } from "redux";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

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
  messages: string[]; // Messages id in this thread (recent first). They have to be manually ordered.
  isFetchingOlder: boolean;
  isFetchingNewer: boolean;
  isFetchingFirst: boolean;
}

export type IConversationThreadList = IOrderedArrayById<IConversationThread> & {
  page?: number;
  isRefreshing?: boolean; // isRefreshing is not as the same level of isFetching, but it's more practical this way.
  end?: boolean;
};

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationThreadList = {
  byId: {},
  end: false,
  ids: [],
  isRefreshing: true,
  page: -1
};

const conversationThreadListReducer = (
  state: IConversationThreadList = stateDefault,
  action: AnyAction
) => {
  switch (action.type) {
    case actionTypes.received:
      // action contains `page`, `data`, `receivedAt` (not used)
      return {
        ...state,
        byId: { ...state.byId, ...action.data.byId },
        end: action.data.ids.length === 0,
        ids: [
          ...state.ids.slice(0, NB_THREADS_PER_PAGE * action.page),
          ...action.data.ids,
          ...state.ids.slice(NB_THREADS_PER_PAGE * (action.page + 1))
        ],
        page: action.page
      };
    case actionTypeResetRequested:
      return {
        ...state // ,
        // isRefreshing: true
      };
    case actionTypeResetReceived:
      return {
        byId: { ...action.data.byId },
        end: false,
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
    case actionTypeThreadResetRequested:
      // action contains `threadId`
      // console.log("reducer: append requested", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.threadId]: {
            ...state.byId[action.threadId],
            isFetchingNewer: true,
            isFetchingFirst: true,
            messages: []
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
    case actionTypeThreadResetReceived:
      // action contains `data`, `threadId`
      // console.log("reducer: append received", action);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.threadId]: {
            ...state.byId[action.threadId],
            isFetchingNewer: false,
            isFetchingFirst: false,
            messages: action.data
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
      // console.log("reducer: (threadList) send message request", action);
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
      // console.log("reducer: (threadList) send message request", action);
      const msglist = state.byId[action.data.oldThreadId].messages;
      const index = msglist.indexOf(action.data.oldId);
      if (index !== -1) {
        msglist[index] = action.data.newId;
      }
      const idsWithoutOldThreadId = state.ids.filter(id => id !== action.data.oldThreadId);
      const idsWithoutOldNewThreadId = state.ids.filter(id => id !== action.data.oldThreadId && id !== action.data.threadId);
      const updatedThread = { ...state.byId[action.data.oldThreadId], messages: msglist, id: action.data.threadId, date: action.data.date };
      const threadAlreadyExists = state.ids.includes(action.data.threadId);
      const isTemporaryThread = action.data.oldThreadId.startsWith("tmp-");
      isTemporaryThread && delete state.byId[action.data.oldThreadId]
      return {
        ...state,
        byId: isTemporaryThread
          ? 
            { [action.data.threadId]: updatedThread, ...state.byId }
          :
            {
              ...state.byId,
              [action.data.threadId]: {
                ...state.byId[action.data.threadId],
                messages: msglist,
                date: action.data.date
              }
            },
        ids: isTemporaryThread
          ? threadAlreadyExists ? [action.data.threadId, ...idsWithoutOldNewThreadId] : [action.data.threadId, ...idsWithoutOldThreadId]
          : [action.data.threadId, ...idsWithoutOldThreadId]
      };
    case actionTypeThreadCreated:
      // console.log("reducer (threadList): create thread");
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.newThread.id]: action.newThread
        },
        ids: [action.newThread.id, ...state.ids]
      };
    case actionTypeThreadDeleted:
      // console.log("reducer (threadList): delete thread");
      const { [action.threadId]: value, ...byId } = state.byId;
      return {
        ...state,
        byId,
        ids: state.ids.filter(v => v !== action.threadId)
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};

export default asyncReducer<IConversationThreadList>(
  conversationThreadListReducer,
  actionTypes
);
