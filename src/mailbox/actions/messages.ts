/**
 * Conversation messages actions
 * Build actions to be dispatched to the conversarion messages reducer.
 */
import moment from "moment";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";
import { asyncActionTypes } from "../../infra/redux/async";
import { IConversationMessageList, IConversationMessageNativeArray } from "../actions/sendMessage";
import conversationConfig from "../config";

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IConversationMessageListBackend = {
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
  attachments: IAttachment[];
}[];

export interface IAttachment {
  id: string;
  name: string;
  charset: string;
  filename: string;
  contentType: string;
  contentTransferEncoding: string;
  size: number; // in Bytes
}

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
    threadId: message.thread_id,
  }));
};

export const actionTypeSetRead = conversationConfig.createActionType("MESSAGES") + "_SET_READ";

export function conversationMessagesSetRead(messageIds: string[]) {
  return { type: actionTypeSetRead, messageIds };
}

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(conversationConfig.createActionType("MESSAGES"));

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

export function conversationSetMessagesRead(messageIds: string[]) {
  return async (dispatch, getState) => {
    try {
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      await signedFetch(`${Conf.currentPlatform.url}/conversation/toggleUnread`, {
        body: JSON.stringify({
          id: messageIds,
          unread: false,
        }),
        method: "POST",
      });
      dispatch(conversationMessagesSetRead(messageIds));
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("failed to mark messages read : ", messageIds);
    }
  };
}
