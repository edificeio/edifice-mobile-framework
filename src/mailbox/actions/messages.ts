/**
 * Conversation messages actions
 * Build actions to be dispatched to the conversarion messages reducer.
 */
import { asyncActionTypes } from "../../infra/redux/async";
import conversationConfig from "../config";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";
import { IConversationMessageList } from "../actions/sendMessage";

// TYPE -------------------------------------------------------------------------------------------

export interface IAttachment {
  id: string;
  name: string;
  charset: string;
  filename: string;
  contentType: string;
  contentTransferEncoding: string;
  size: number; // in Bytes
}

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypeSetRead = conversationConfig.createActionType("MESSAGES") + "_SET_READ";

export function conversationMessagesSetRead(messageIds: string[]) {
  return { type: actionTypeSetRead, messageIds };
}

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
      await signedFetch(`${Conf.currentPlatform.url}${conversationConfig.appInfo.prefix}/toggleUnread`, {
        body: JSON.stringify({
          id: messageIds,
          unread: false
        }),
        method: "POST"
      });
      dispatch(conversationMessagesSetRead(messageIds));
    } catch (errmsg) {
      // tslint:disable-next-line:no-console
      console.warn("failed to mark messages read : ", messageIds);
    }
  };
}
