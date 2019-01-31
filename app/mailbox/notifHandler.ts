import Conf from "../Conf";
import { signedFetch } from "../infra/fetchWithCache";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import {
  fetchConversationThreadList,
  fetchConversationThreadResetMessages
} from "./actions/threadList";
import conversationThreadSelected from "./actions/threadSelected";

export default dispatch => async notificationData => {
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return;
  }
  const split = notificationData.resourceUri.split("/");
  const messageId = split[split.length - 1];
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  const response = await signedFetch(
    `${Conf.currentPlatform.url}/conversation/message/${messageId}`,
    {}
  );
  const message = await response.json();

  try {
    await dispatch(await fetchConversationThreadList());
  } catch (e) {
    if (!(e.type && e.type === "ALREADY_FETCHED")) {
      throw e;
    } else {
      console.log("threads page already fetched, pass");
    }
  }
  await dispatch(await conversationThreadSelected(message.thread_id));
  await dispatch(await fetchConversationThreadResetMessages(message.thread_id));
  nainNavNavigate("thread");
};
