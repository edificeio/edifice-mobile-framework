/**
 * Conversation thread list state reducer
 */
import moment from "moment";

import { IOrderedArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import {
  actionTypeResetReceived,
  actionTypeResetRequested,
  actionTypes,
  NB_THREADS_PER_PAGE
} from "../actions/threadList";
import { IConversationMessage, IConversationMessageList } from "./messages";

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
        // ids: [...state.ids, ...action.data.ids],
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
      console.log("reset received");
      return {
        byId: { ...action.data.byId },
        ids: [...action.data.ids],
        isRefreshing: false,
        page: 0
      };
    default:
      return state;
  }
};

export default asyncReducer<IConversationThreadList>(
  conversationThreadListReducer,
  actionTypes
);
