import Conf from "../../ode-framework-conf";
import { signedFetch } from "../infra/fetchWithCache";
import { mainNavNavigate } from "../navigation/helpers/navHelper";
import {
  fetchConversationThreadAllMessages,
  resetConversationThreadList
} from "./actions/threadList";
import conversationThreadSelected from "./actions/threadSelected";
import { NotificationHandlerFactory } from "../infra/pushNotification";
import { Trackers } from "../infra/tracker";

//TODO add types args
const mailboxNotifHandlerFactory :NotificationHandlerFactory<any,any,any> = dispatch => async (notificationData, apps, doTrack) => {
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return false;
  }
  const split = notificationData.resourceUri.split("/");
  const messageId = split[split.length - 1];
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const messageResponse = await signedFetch(`${Conf.currentPlatform.url}/conversation/message/${messageId}`, {});
  const message = await messageResponse.json();
  const threadId = message.thread_id;
  try {
    try {
      await dispatch(await resetConversationThreadList());
    } catch (e) {
      if (!(e.type && e.type === "ALREADY_FETCHED")) {
        throw e;
      } else {
      }
    }
    await dispatch(await fetchConversationThreadAllMessages(threadId));
    await dispatch(await conversationThreadSelected(threadId));
    mainNavNavigate("thread");
  } catch (e) {
    console.warn(e);
    mainNavNavigate("listThreads");
  }
  const notifPathBegin = '/' + notificationData.resourceUri.replace(/^\/+/g, '').split('/')[0];
  doTrack && Trackers.trackEvent(doTrack, "Conversation", notifPathBegin);
  return true;
};
export default mailboxNotifHandlerFactory;
