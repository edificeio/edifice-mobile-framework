import { asyncGetJson } from "../../../infra/redux/async";
import { IAttachment } from "../messages";
import { IConversationThread } from "../../reducers";
import { IConversationMessageNativeArray } from "../sendMessage";
import moment from "moment";

// TYPE ----------------------------------------------------------------------------------------

export type IConversationMessageBackend = {
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
  attachments: Array<IAttachment>;
}

// Data type of what is given by the backend.
export type IConversationMessageListBackend = Array<IConversationMessageBackend>;

// ADAPTER ----------------------------------------------------------------------------------------

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

// API ----------------------------------------------------------------------------------------

export function conversationGetOlderMessages(threadInfo: IConversationThread) {
  const oldestMessageId = threadInfo.messages[threadInfo.messages.length - 1];

  return asyncGetJson(`/conversation/thread/previous-messages/${oldestMessageId}`, conversationOrderedMessagesAdapter);
}

export function conversationGetNewerMessages(threadInfo: IConversationThread) {
  const newestMessageId = threadInfo.messages[0];

  return asyncGetJson(`/conversation/thread/new-messages/${newestMessageId}`, conversationOrderedMessagesAdapter);
}

export function conversationGetThreadMessages(threadId: string) {
  return asyncGetJson(`/conversation/thread/messages/${threadId}`, conversationOrderedMessagesAdapter);
}
