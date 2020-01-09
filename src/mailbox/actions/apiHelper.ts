import config from "../config";
import {
  conversationGetOlderMessages,
  conversationGetNewerMessages,
  conversationGetThreadMessages,
} from "./services/mailbox";
import {
  zimbraGetOlderMessages,
  zimbraGetNewerMessages,
  zimbraGetThreadMessages,
} from "./services/zimbra";
import {
  conversationThreadAppendRequested,
  conversationThreadAppendReceived,
  conversationThreadListFetchError,
  conversationSetThreadRead,
  conversationThreadResetRequested,
  conversationThreadResetReceived,
} from "./threadList";
import { IConversationMessageList } from "../reducers";
import { conversationMessagesReceived } from "./messages";

// TYPE --------------------------------------------------------------------------------------------------

enum MAIL_SERVICE_TYPE {
  MESSAGERIE = "MESSAGERIE",
  ZIMBRA = "ZIMBRA",
}

type MailServiceCallback = {
  [type in MAIL_SERVICE_TYPE]: Function;
};

// UTILITY FUNCTION ----------------------------------------------------------------------------------------

const pickService = (callback: MailServiceCallback) => {
  // return callback[config.appInfo.name.toUpperCase() as MAIL_SERVICE_TYPE];
  return callback[MAIL_SERVICE_TYPE.ZIMBRA];
};

// API --------------------------------------------------------------------------------------------------

const localState = globalState => config.getLocalState(globalState).threadList;

export function fetchConversationThreadOlderMessages(threadId: string) {
  return async (dispatch, getState) => {
    try {
      const threadInfo = localState(getState()).data.byId[threadId];
      if (threadInfo.isFetchingOlder) return; // No fetch is already fetching, it's important, otherwise, there will maybe have doublons

      dispatch(conversationThreadAppendRequested(threadId, false));

      let callback = {
        [MAIL_SERVICE_TYPE.MESSAGERIE]: conversationGetOlderMessages,
        [MAIL_SERVICE_TYPE.ZIMBRA]: zimbraGetOlderMessages,
      };
      const data = await pickService(callback)(threadInfo);

      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      const messageIds = [];
      for (const message of data) {
        messages[message.id] = message;
        messageIds.push(message.id);
      }
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

      let callback = {
        [MAIL_SERVICE_TYPE.MESSAGERIE]: conversationGetNewerMessages,
        [MAIL_SERVICE_TYPE.ZIMBRA]: zimbraGetNewerMessages,
      };
      // Fetch data
      const data = await pickService(callback)(threadInfo);

      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      const messageIds = [];
      for (const message of data) {
        messages[message.id] = message;
        messageIds.push(message.id);
      }

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
  return async dispatch => {
    try {
      dispatch(conversationThreadResetRequested(threadId));
      // Fetch data

      let callback = {
        [MAIL_SERVICE_TYPE.MESSAGERIE]: conversationGetThreadMessages,
        [MAIL_SERVICE_TYPE.ZIMBRA]: zimbraGetThreadMessages,
      };
      const data = await pickService(callback)(threadId);

      // Extract messageIds list and contents
      const messages: IConversationMessageList = {};
      const messageIds = [];
      for (const message of data) {
        messages[message.id] = message;
        messageIds.push(message.id);
      }
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
