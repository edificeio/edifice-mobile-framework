/**
 * Homework diary list state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import moment from "moment";

import { IOrderedArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/threadList";

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
}

export type IConversationThreadList = IOrderedArrayById<IConversationThread>;

export interface IConversationMessage {
  // It's like an IMessage ! LOL !
  id: string; // Message's own id
  parentId: string; // Id of the message that it reply to
  subject: string; // Subject of the message
  body: string; // Content of the message. It's HTML.
  from: string; // User id of the sender
  fromName: string; // Name of the sender
  to: string[]; // User Ids of the receivers
  toName: string[]; // Name of the receivers
  cc: string[]; // User Ids of the copy receivers
  ccName: string[]; // Name of the copy receivers
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  date: moment.Moment; // DateTime of the message
  threadId: string; // Id of the thread (Id of the first message in this thread).
  unread: boolean; // Self-explaining
  rownum: number; // number of the message in the thread (starting from 1 from the newest to the latest).
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationThreadList = { byId: {}, ids: [] };

const conversationThreadListReducer = (
  state: IConversationThreadList = stateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      // action contains `page`, `data`, `receivedAt`
      // CAUTION : In this case, received threads are pushed at th end of the array. NEVER use this action to reload a page.
      return {
        byId: { ...state.byId, ...action.data.byId },
        ids: [...state.ids, ...action.data.ids]
      };
    default:
      return state;
  }
};

export default asyncReducer<IConversationThreadList>(
  conversationThreadListReducer,
  actionTypes
);
