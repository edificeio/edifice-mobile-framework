import Conf from "../../ode-framework-conf";
import { signedFetch } from "../infra/fetchWithCache";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import {
  fetchConversationThreadResetMessages,
  resetConversationThreadList
} from "./actions/threadList";
import conversationThreadSelected from "./actions/threadSelected";
import { NotificationHandlerFactory } from "../infra/pushNotification";

//TODO add types args
const mailboxNotifHandlerFactory :NotificationHandlerFactory<any,any,any> =  dispatch => async notificationData => {
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return false;
  }
  const split = notificationData.resourceUri.split("/");
  const messageId = split[split.length - 1];
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const response = await signedFetch(
    `${Conf.currentPlatform.url}/conversation/message/${messageId}`,
    {}
  );
  const message = await response.json();
  // console.log("notif message", message);
  try {
    try {
      await dispatch(await resetConversationThreadList());
    } catch (e) {
      if (!(e.type && e.type === "ALREADY_FETCHED")) {
        throw e;
      } else {
        // console.log("threads page already fetched, pass");
      }
    }
    await dispatch(await conversationThreadSelected(message.thread_id));
    await dispatch(
      await fetchConversationThreadResetMessages(message.thread_id)
    );
    nainNavNavigate("thread");
  } catch (e) {
    console.warn(e);
    nainNavNavigate("listThreads");
  }
  return true;
};
export default mailboxNotifHandlerFactory;
