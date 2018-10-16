/**
 * Conversation messages state reducer
 * Flattened list of all loaded messages.
 */
import moment from "moment";

import { IArrayById } from "../../infra/collections";
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/messages";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

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
  status: ConversationMessageStatus; // sending status of the message
}

export type IConversationMessageList = IArrayById<IConversationMessage>;

export enum ConversationMessageStatus {
  sent,
  sending,
  failed
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IConversationMessageList = {};

const conversationThreadListReducer = (
  state: IConversationMessageList = stateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      // action contains, `data`, `receivedAt` (not used)
      return {
        ...state,
        ...action.data // if a message already exists with its Id, it is replaced.
      };
    default:
      return state;
  }
};

export default asyncReducer<IConversationMessageList>(
  conversationThreadListReducer,
  actionTypes
);
