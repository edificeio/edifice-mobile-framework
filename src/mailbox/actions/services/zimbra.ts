import { asyncGetJson } from "../../../infra/redux/async";
import { IConversationThread } from "../../reducers";
import { IConversationMessageBackend, conversationOrderedMessagesAdapter } from "./mailbox";
import { IConversationMessageNativeArray } from "../sendMessage";
import Conf from "../../../../ode-framework-conf";

// TYPE ----------------------------------------------------------------------------------------

type IZimbraMessageMessageBackend = IConversationMessageBackend & {
  is_draft: boolean;
  is_trashed: boolean;
};

type IZimbraMessageListBackend = Array<IZimbraMessageMessageBackend>;

// ADAPTER ----------------------------------------------------------------------------------------

const isDraft: (message: IZimbraMessageMessageBackend) => boolean = message => {
  return message.is_draft;
};

const isTrash: (message: IZimbraMessageMessageBackend) => boolean = message => {
  return message.is_trashed;
};

export const zimbraOrderedMessagesAdapter: (
  data: IZimbraMessageListBackend
) => IConversationMessageNativeArray = data => {
  const filteredTrashDraft = data.filter(message => !isDraft(message) && !isTrash(message));
  const sanitizedMails = filteredTrashDraft.map(mail => {
    const sanitizedBody = RegExp(/<body[^>]*>(.*)<\/body>\s*<\/html>\s*$/gs).exec(mail.body);
    return { ...mail, body: sanitizedBody ? sanitizedBody[1] : mail.body };
  });
  return conversationOrderedMessagesAdapter(sanitizedMails);
};

// API ----------------------------------------------------------------------------------------

const getOlderMessages = async (threadId, threadMessages, page) => {
  try {
    if (threadId.startsWith("tmp-")) {
      return [];
    }

    const data = await asyncGetJson(`/zimbra/thread/get-page/${threadId}?page=${page}`, zimbraOrderedMessagesAdapter);

    if (data.length == 0) {
      return [];
    }

    const firstOldMessageIndex = data.findIndex(message => threadMessages.includes(message.id));
    const dataWithoutNewerMessages = data.slice(firstOldMessageIndex);
    const filteredMessages = dataWithoutNewerMessages.filter(message => !threadMessages.includes(message.id));

    if (filteredMessages.length > 0) {
      return filteredMessages;
    } else {
      return getOlderMessages(threadId, threadMessages, page + 1);
    }
  } catch (e) {
    return e;
  }
};

const getNewerMessages = async (threadId, threadMessages, page) => {
  try {
    if (threadId.startsWith("tmp-")) {
      return [];
    }

    const data = await asyncGetJson(`/zimbra/thread/get-page/${threadId}?page=${page}`, zimbraOrderedMessagesAdapter);

    if (data.length == 0) {
      return [];
    }

    const firstOldMessageIndex = data.findIndex(message => threadMessages.includes(message.id));

    if (firstOldMessageIndex != -1) {
      return data.slice(0, firstOldMessageIndex);
    } else {
      return [...data, ...getNewerMessages(threadId, threadMessages, page + 1)];
    }
  } catch (e) {
    return e;
  }
};

export const zimbraGetOlderMessages = async (threadInfo: IConversationThread) => {
  const page = Math.floor(threadInfo.messages.length / (Conf.currentPlatform.zimbraMaxMailPerPage || 10));
  const result = await getOlderMessages(threadInfo.id, threadInfo.messages, page);
  return Array.isArray(result) ? Promise.resolve(result) : Promise.reject(result);
};

export const zimbraGetNewerMessages = async (threadInfo: IConversationThread) => {
  const result = await getNewerMessages(threadInfo.id, threadInfo.messages, 0);
  return Array.isArray(result) ? Promise.resolve(result) : Promise.reject(result);
};

export const zimbraGetThreadMessages = (threadId: string) => {
  return asyncGetJson(`/zimbra/thread/get-page/${threadId}`, zimbraOrderedMessagesAdapter);
};
